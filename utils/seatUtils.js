const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const SeatHold = require('../models/SeatHold');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const AppError = require('./AppError');

const normalizeCode = (value) =>
  typeof value === 'string'
    ? value.trim().toUpperCase()
    : '';

const requireCode = (value, fieldName) => {
  const code = normalizeCode(value);

  if (!code) {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  return code;
};

const parseSeatList = (seats) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw new AppError(
      'seats must be a non-empty array, for example ["A5","A6"].',
      400
    );
  }

  const list = seats.map(normalizeCode);

  if (list.some((seat) => !seat)) {
    throw new AppError(
      'Every seat must be a non-empty string.',
      400
    );
  }

  if (new Set(list).size !== list.length) {
    throw new AppError(
      'The seats array contains duplicate seats.',
      400
    );
  }

  return list;
};

const getHoldMinutes = () => {
  const minutes = Number(process.env.SEAT_HOLD_MINUTES);

  return Number.isFinite(minutes) && minutes > 0
    ? minutes
    : 5;
};

const getUserOrThrow = async (userId) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new AppError(`User ${userId} not found.`, 404);
  }

  return user;
};

const getShowtimeOrThrow = async (showtimeId) => {
  const showtime = await Showtime.findOne({ showtimeId });

  if (!showtime) {
    throw new AppError(
      `Showtime ${showtimeId} not found.`,
      404
    );
  }

  return showtime;
};

const getHallSeats = async (hallId) => {
  const hall = await Hall.findOne({ hallId }).lean();

  if (!hall) {
    throw new AppError(`Hall ${hallId} not found.`, 404);
  }

  return hall.seats;
};

const seatExists = async (hallId, seatNumber) => {
  const seats = await getHallSeats(hallId);

  return seats.includes(seatNumber);
};

const assertSeatsExist = async (hallId, seatNumbers) => {
  const hallSeats = new Set(
    await getHallSeats(hallId)
  );

  const invalid = seatNumbers.filter(
    (seat) => !hallSeats.has(seat)
  );

  if (invalid.length > 0) {
    throw new AppError(
      `Invalid seat(s) for this hall: ${invalid.join(', ')}.`,
      400
    );
  }
};

const getBookedSeats = async (
  showtimeId,
  { excludeBookingId } = {}
) => {
  const filter = {
    showtimeId,
    isActive: true,
  };

  if (excludeBookingId) {
    filter.bookingId = {
      $ne: excludeBookingId,
    };
  }

  const bookings = await Booking.find(filter)
    .select('seats.seatNumber')
    .lean();

  return bookings.flatMap((booking) =>
    booking.seats.map((seat) => seat.seatNumber)
  );
};

const getActiveHeldSeats = async (showtimeId) =>
  SeatHold.find({
    showtimeId,
    expiresAt: {
      $gt: new Date(),
    },
  }).lean();

const getSeatStatuses = async (showtime) => {
  const [
    hallSeats,
    bookedSeats,
    holds,
  ] = await Promise.all([
    getHallSeats(showtime.hallId),
    getBookedSeats(showtime.showtimeId),
    getActiveHeldSeats(showtime.showtimeId),
  ]);

  const bookedSet = new Set(bookedSeats);

  const holdBySeat = new Map(
    holds.map((hold) => [
      hold.seatNumber,
      hold,
    ])
  );

  return hallSeats.map((seatNumber) => {
    if (bookedSet.has(seatNumber)) {
      return {
        seatNumber,
        status: 'booked',
      };
    }

    const hold = holdBySeat.get(seatNumber);

    if (hold) {
      return {
        seatNumber,
        status: 'held',
        heldBy: hold.userId,
        expiresAt: hold.expiresAt,
      };
    }

    return {
      seatNumber,
      status: 'available',
    };
  });
};

const getAvailableSeats = async (showtime) => {
  const statuses = await getSeatStatuses(showtime);

  return statuses
    .filter((seat) => seat.status === 'available')
    .map((seat) => seat.seatNumber);
};

const removeExpiredHolds = async (filter = {}) => {
  const expired = await SeatHold.find({
    ...filter,
    expiresAt: {
      $lte: new Date(),
    },
  }).lean();

  if (expired.length > 0) {
    await SeatHold.deleteMany({
      _id: {
        $in: expired.map((hold) => hold._id),
      },
    });
  }

  return expired;
};

const removeHoldsForSeats = async (
  showtimeId,
  seatNumbers,
  userId
) => {
  const filter = {
    showtimeId,
    seatNumber: {
      $in: seatNumbers,
    },
  };

  if (userId) {
    filter.userId = userId;
  }

  const result = await SeatHold.deleteMany(filter);

  return result.deletedCount;
};

const findUnavailableSeat = async ({
  showtimeId,
  seatNumbers,
  userId,
  excludeBookingId,
}) => {
  const [
    bookedSeats,
    holds,
  ] = await Promise.all([
    getBookedSeats(showtimeId, {
      excludeBookingId,
    }),
    getActiveHeldSeats(showtimeId),
  ]);

  const bookedSet = new Set(bookedSeats);

  for (const seatNumber of seatNumbers) {
    if (bookedSet.has(seatNumber)) {
      return {
        seatNumber,
        reason: 'booked',
      };
    }

    const foreignHold = holds.find(
      (hold) =>
        hold.seatNumber === seatNumber &&
        hold.userId !== userId
    );

    if (foreignHold) {
      return {
        seatNumber,
        reason: 'held',
      };
    }
  }

  return null;
};

const assertSeatsAvailable = async (args) => {
  const conflict = await findUnavailableSeat(args);

  if (conflict) {
    const message =
      conflict.reason === 'booked'
        ? `Seat ${conflict.seatNumber} is already booked.`
        : `Seat ${conflict.seatNumber} is currently held by another user.`;

    throw new AppError(message, 409);
  }
};

const holdSeat = async ({
  showtimeId,
  seatNumber,
  userId,
}) => {
  const cleanShowtimeId = requireCode(
    showtimeId,
    'showtimeId'
  );

  const cleanUserId = requireCode(
    userId,
    'userId'
  );

  const seat = requireCode(
    seatNumber,
    'seatNumber'
  );

  await getUserOrThrow(cleanUserId);

  const showtime =
    await getShowtimeOrThrow(cleanShowtimeId);

  await assertSeatsExist(
    showtime.hallId,
    [seat]
  );

  await removeExpiredHolds({
    showtimeId: cleanShowtimeId,
    seatNumber: seat,
  });

  await assertSeatsAvailable({
    showtimeId: cleanShowtimeId,
    seatNumbers: [seat],
    userId: cleanUserId,
  });

  const expiresAt = new Date(
    Date.now() +
      getHoldMinutes() *
        60 *
        1000
  );

  let hold;

  try {
    hold = await SeatHold.create({
      showtimeId: cleanShowtimeId,
      seatNumber: seat,
      userId: cleanUserId,
      expiresAt,
    });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    hold = await SeatHold.findOneAndUpdate(
      {
        showtimeId: cleanShowtimeId,
        seatNumber: seat,
        userId: cleanUserId,
      },
      {
        $set: {
          expiresAt,
        },
      },
      {
        new: true,
      }
    );

    if (!hold) {
      throw new AppError(
        `Seat ${seat} is currently held by another user.`,
        409
      );
    }
  }

  const nowBooked = await Booking.exists({
    showtimeId: cleanShowtimeId,
    isActive: true,
    'seats.seatNumber': seat,
  });

  if (nowBooked) {
    await SeatHold.deleteOne({
      _id: hold._id,
    });

    throw new AppError(
      `Seat ${seat} is already booked.`,
      409
    );
  }

  return {
    showtimeId: hold.showtimeId,
    seatNumber: hold.seatNumber,
    userId: hold.userId,
    expiresAt: hold.expiresAt,
  };
};

const releaseHold = async ({
  showtimeId,
  seatNumber,
  userId,
}) => {
  const cleanShowtimeId = requireCode(
    showtimeId,
    'showtimeId'
  );

  const cleanUserId = requireCode(
    userId,
    'userId'
  );

  const seat = requireCode(
    seatNumber,
    'seatNumber'
  );

  const hold = await SeatHold.findOne({
    showtimeId: cleanShowtimeId,
    seatNumber: seat,
  });

  if (
    !hold ||
    hold.expiresAt <= new Date()
  ) {
    throw new AppError(
      `No active hold found for seat ${seat} (it may have expired).`,
      404
    );
  }

  if (hold.userId !== cleanUserId) {
    throw new AppError(
      `Seat ${seat} is held by another user.`,
      403
    );
  }

  await SeatHold.deleteOne({
    _id: hold._id,
  });

  return {
    showtimeId: cleanShowtimeId,
    seatNumber: seat,
  };
};

const cancelStalePendingBookings = async (minutes) => {
  const cutoff = new Date(
    Date.now() -
      minutes *
        60 *
        1000
  );

  const stale = await Booking.find({
    status: 'pending',
    createdAt: {
      $lt: cutoff,
    },
  }).lean();

  const cancelled = [];

  for (const booking of stale) {
    const updated =
      await Booking.findOneAndUpdate(
        {
          bookingId: booking.bookingId,
          status: 'pending',
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
      ).lean();

    if (updated) {
      cancelled.push(updated);
    }
  }

  return cancelled;
};

module.exports = {
  normalizeCode,
  requireCode,
  parseSeatList,
  getUserOrThrow,
  getShowtimeOrThrow,
  getHallSeats,
  seatExists,
  assertSeatsExist,
  getBookedSeats,
  getActiveHeldSeats,
  getSeatStatuses,
  getAvailableSeats,
  removeExpiredHolds,
  removeHoldsForSeats,
  findUnavailableSeat,
  assertSeatsAvailable,
  holdSeat,
  releaseHold,
  cancelStalePendingBookings,
};