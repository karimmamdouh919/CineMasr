const Booking = require('../models/Booking');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const Counter = require('../models/Counter');
const AppError = require('../utils/AppError');

const {
  requireCode,
  parseSeatList,
  getUserOrThrow,
  getShowtimeOrThrow,
  getSeatStatuses,
  assertSeatsExist,
  assertSeatsAvailable,
  removeHoldsForSeats,
} = require('../utils/seatUtils');

const { emitSeatBooked, emitSeatReleased } = require('../sockets/seatSocket');

const BOOKING_ID_REGEX = /^BOOK\d{3,}$/;
const UPDATABLE_FIELDS = ['seats'];
const SEATS_TAKEN_MESSAGE = 'One or more selected seats are no longer available.';

const parseBookingId = (raw) => {
  const id = typeof raw === 'string' ? raw.trim().toUpperCase() : '';

  if (!BOOKING_ID_REGEX.test(id)) {
    throw new AppError(
      `Invalid booking ID "${raw}". Expected a format like BOOK001.`,
      400
    );
  }

  return id;
};

const findBookingOrThrow = async (bookingId) => {
  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    throw new AppError(`Booking ${bookingId} not found.`, 404);
  }

  return booking;
};

const buildSeatLines = (seatNumbers, ticketPrice) =>
  seatNumbers.map((seatNumber) => ({
    seatNumber,
    price: ticketPrice,
  }));

const releaseSeatsOfBooking = async (booking, io) => {
  const seatNumbers = booking.seats.map((seat) => seat.seatNumber);

  await removeHoldsForSeats(
    booking.showtimeId,
    seatNumbers,
    booking.userId
  );

  seatNumbers.forEach((seatNumber) =>
    emitSeatReleased(io, booking.showtimeId, seatNumber)
  );
};

const getShowtimeSeats = async (req, res, next) => {
  try {
    const showtimeId = requireCode(req.params.showtimeId, 'showtimeId');
    const showtime = await getShowtimeOrThrow(showtimeId);
    const seats = await getSeatStatuses(showtime);

    res.status(200).json({
      success: true,
      showtimeId,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const body = req.body || {};

    const userId = requireCode(body.userId, 'userId');
    const showtimeId = requireCode(body.showtimeId, 'showtimeId');
    const seatNumbers = parseSeatList(body.seats);

    await getUserOrThrow(userId);

    const showtime = await getShowtimeOrThrow(showtimeId);

    await assertSeatsExist(showtime.hallId, seatNumbers);

    await assertSeatsAvailable({
      showtimeId,
      seatNumbers,
      userId,
    });

    const sequence = await Counter.next('booking');
    const bookingId = `BOOK${String(sequence).padStart(3, '0')}`;

    const totalAmount = seatNumbers.length * showtime.ticketPrice;

    let booking;

    try {
      booking = await Booking.create({
        bookingId,
        userId,
        showtimeId,
        seats: buildSeatLines(seatNumbers, showtime.ticketPrice),
        totalAmount,
        status: 'pending',
      });
    } catch (error) {
      if (
        error.code === 11000 &&
        !(error.keyPattern && error.keyPattern.bookingId)
      ) {
        throw new AppError(SEATS_TAKEN_MESSAGE, 409);
      }

      throw error;
    }

    await removeHoldsForSeats(showtimeId, seatNumbers);

    emitSeatBooked(req.app.get('io'), {
      showtimeId,
      seats: seatNumbers,
      bookingId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const bookingId = parseBookingId(req.params.id);
    const booking = await findBookingOrThrow(bookingId);

    const [user, showtime] = await Promise.all([
      User.findOne({ userId: booking.userId })
        .select('-_id -__v -createdAt -updatedAt')
        .lean(),

      Showtime.findOne({ showtimeId: booking.showtimeId })
        .select('-_id -__v -createdAt -updatedAt')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      booking,
      details: {
        user,
        showtime,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = requireCode(req.params.userId, 'userId');

    await getUserOrThrow(userId);

    const bookings = await Booking.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      userId,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const bookingId = parseBookingId(req.params.id);
    const body = req.body || {};

    const forbidden = Object.keys(body).filter(
      (field) => !UPDATABLE_FIELDS.includes(field)
    );

    if (forbidden.length > 0) {
      throw new AppError(
        `Field(s) not allowed to be updated: ${forbidden.join(
          ', '
        )}. Only "seats" can be changed here. ` +
          'Payment results must go through PATCH /api/bookings/:id/payment-status.',
        400
      );
    }

    if (body.seats === undefined) {
      throw new AppError(
        'Nothing to update. Allowed field: seats.',
        400
      );
    }

    const booking = await findBookingOrThrow(bookingId);

    if (booking.status !== 'pending') {
      throw new AppError(
        `Only pending bookings can be updated (current status: ${booking.status}).`,
        409
      );
    }

    const showtime = await getShowtimeOrThrow(booking.showtimeId);
    const seatNumbers = parseSeatList(body.seats);

    await assertSeatsExist(showtime.hallId, seatNumbers);

    await assertSeatsAvailable({
      showtimeId: booking.showtimeId,
      seatNumbers,
      userId: booking.userId,
      excludeBookingId: bookingId,
    });

    const previousSeats = booking.seats.map(
      (seat) => seat.seatNumber
    );

    const totalAmount = seatNumbers.length * showtime.ticketPrice;

    let updated;

    try {
      updated = await Booking.findOneAndUpdate(
        {
          bookingId,
          status: 'pending',
        },
        {
          $set: {
            seats: buildSeatLines(
              seatNumbers,
              showtime.ticketPrice
            ),
            totalAmount,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(SEATS_TAKEN_MESSAGE, 409);
      }

      throw error;
    }

    if (!updated) {
      throw new AppError(
        'Booking is no longer pending and cannot be updated.',
        409
      );
    }

    const added = seatNumbers.filter(
      (seat) => !previousSeats.includes(seat)
    );

    const removed = previousSeats.filter(
      (seat) => !seatNumbers.includes(seat)
    );

    if (added.length > 0) {
      await removeHoldsForSeats(
        updated.showtimeId,
        added
      );
    }

    const io = req.app.get('io');

    removed.forEach((seat) =>
      emitSeatReleased(
        io,
        updated.showtimeId,
        seat
      )
    );

    if (added.length > 0) {
      emitSeatBooked(io, {
        showtimeId: updated.showtimeId,
        seats: added,
        bookingId,
        status: 'pending',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = parseBookingId(req.params.id);

    const cancelled = await Booking.findOneAndUpdate(
      {
        bookingId,
        status: {
          $in: ['pending', 'confirmed'],
        },
      },
      {
        $set: {
          status: 'cancelled',
          isActive: false,
        },
      },
      {
        new: true,
      }
    );

    if (!cancelled) {
      await findBookingOrThrow(bookingId);

      throw new AppError(
        'Invalid status transition: booking is already cancelled.',
        409
      );
    }

    await releaseSeatsOfBooking(
      cancelled,
      req.app.get('io')
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const bookingId = parseBookingId(req.params.id);
    const { status } = req.body || {};

    if (!['confirmed', 'cancelled'].includes(status)) {
      throw new AppError(
        `Invalid status "${status}". Allowed values: confirmed, cancelled.`,
        400
      );
    }

    const updated = await Booking.findOneAndUpdate(
      {
        bookingId,
        status: 'pending',
      },
      {
        $set: {
          status,
          isActive: status === 'confirmed',
        },
      },
      {
        new: true,
      }
    );

    if (!updated) {
      const existing = await findBookingOrThrow(bookingId);

      throw new AppError(
        `Invalid status transition: ${existing.status} -> ${status}. Only pending bookings can be changed by a payment result.`,
        409
      );
    }

    const io = req.app.get('io');

    if (status === 'confirmed') {
      const seatNumbers = updated.seats.map(
        (seat) => seat.seatNumber
      );

      await removeHoldsForSeats(
        updated.showtimeId,
        seatNumbers
      );

      emitSeatBooked(io, {
        showtimeId: updated.showtimeId,
        seats: seatNumbers,
        bookingId,
        status: 'confirmed',
      });
    } else {
      await releaseSeatsOfBooking(updated, io);
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully.`,
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowtimeSeats,
  createBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
  updateBooking,
  cancelBooking,
  updatePaymentStatus,
};