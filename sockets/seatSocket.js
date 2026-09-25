const AppError = require('../utils/AppError');
const seatUtils = require('../utils/seatUtils');

const SWEEP_INTERVAL_MS = 5000;

const roomName = (showtimeId) => `showtime:${showtimeId}`;

const emitSeatHeld = (io, hold) => {
  if (!io) return;

  io.to(roomName(hold.showtimeId)).emit('seatHeld', {
    showtimeId: hold.showtimeId,
    seatNumber: hold.seatNumber,
    userId: hold.userId,
    expiresAt: hold.expiresAt,
  });
};

const emitSeatReleased = (io, showtimeId, seatNumber) => {
  if (!io) return;

  io.to(roomName(showtimeId)).emit('seatReleased', {
    showtimeId,
    seatNumber,
  });
};

const emitSeatBooked = (
  io,
  { showtimeId, seats, bookingId, status }
) => {
  if (!io) return;

  io.to(roomName(showtimeId)).emit('seatBooked', {
    showtimeId,
    seats,
    bookingId,
    status,
  });
};

const registerSeatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const handle = (eventName, work) => async (payload, ack) => {
      const data =
        payload && typeof payload === 'object'
          ? payload
          : {};

      try {
        const result = await work(data);

        if (typeof ack === 'function') {
          ack({
            success: true,
            ...result,
          });
        }
      } catch (error) {
        const known = error instanceof AppError;

        if (!known) {
          console.error(
            `Socket error in ${eventName}:`,
            error
          );
        }

        const failure = {
          success: false,
          event: eventName,
          message: known
            ? error.message
            : 'Internal server error.',
          statusCode: known
            ? error.statusCode
            : 500,
        };

        socket.emit('seatError', failure);

        if (typeof ack === 'function') {
          ack(failure);
        }
      }
    };

    socket.on(
      'joinShowtime',
      handle('joinShowtime', async ({ showtimeId }) => {
        const id = seatUtils.requireCode(
          showtimeId,
          'showtimeId'
        );

        const showtime =
          await seatUtils.getShowtimeOrThrow(id);

        const room = roomName(id);

        socket.join(room);

        const seats =
          await seatUtils.getSeatStatuses(showtime);

        const result = {
          showtimeId: id,
          room,
          message: `Joined ${room}`,
          seats,
        };

        socket.emit('joinedShowtime', {
          success: true,
          ...result,
        });

        return result;
      })
    );

    socket.on(
      'leaveShowtime',
      handle('leaveShowtime', async ({ showtimeId }) => {
        const id = seatUtils.requireCode(
          showtimeId,
          'showtimeId'
        );

        socket.leave(roomName(id));

        return {
          showtimeId: id,
          message: `Left ${roomName(id)}`,
        };
      })
    );

    socket.on(
      'selectSeat',
      handle(
        'selectSeat',
        async ({ showtimeId, seatNumber, userId }) => {
          const hold = await seatUtils.holdSeat({
            showtimeId,
            seatNumber,
            userId,
          });

          emitSeatHeld(io, hold);

          return {
            message: `Seat ${hold.seatNumber} is held for you.`,
            hold,
          };
        }
      )
    );

    socket.on(
      'releaseSeat',
      handle(
        'releaseSeat',
        async ({ showtimeId, seatNumber, userId }) => {
          const released =
            await seatUtils.releaseHold({
              showtimeId,
              seatNumber,
              userId,
            });

          emitSeatReleased(
            io,
            released.showtimeId,
            released.seatNumber
          );

          return {
            message: `Seat ${released.seatNumber} released.`,
            ...released,
          };
        }
      )
    );

    socket.on('disconnect', (reason) => {
      console.log(
        `Socket disconnected: ${socket.id} (${reason})`
      );
    });
  });
};

const startExpiryJobs = (io) => {
  let running = false;

  const sweep = async () => {
    if (running) return;

    running = true;

    try {
      const expiredHolds =
        await seatUtils.removeExpiredHolds();

      expiredHolds.forEach((hold) => {
        console.log(
          `Hold expired: ${hold.showtimeId} ${hold.seatNumber} (${hold.userId})`
        );

        emitSeatReleased(
          io,
          hold.showtimeId,
          hold.seatNumber
        );
      });

      const pendingMinutes =
        Number(process.env.PENDING_BOOKING_MINUTES) || 15;

      const cancelled =
        await seatUtils.cancelStalePendingBookings(
          pendingMinutes
        );

      cancelled.forEach((booking) => {
        console.log(
          `Unpaid booking auto-cancelled: ${booking.bookingId}`
        );

        booking.seats.forEach((seat) =>
          emitSeatReleased(
            io,
            booking.showtimeId,
            seat.seatNumber
          )
        );
      });
    } catch (error) {
      console.error(
        'Expiry job error:',
        error.message
      );
    } finally {
      running = false;
    }
  };

  sweep();

  return setInterval(
    sweep,
    SWEEP_INTERVAL_MS
  );
};

module.exports = {
  registerSeatSocket,
  startExpiryJobs,
  roomName,
  emitSeatHeld,
  emitSeatReleased,
  emitSeatBooked,
};