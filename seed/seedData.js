require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const SeatHold = require('../models/SeatHold');
const Counter = require('../models/Counter');
const { users, hall, showtimes } = require('../mock/mockData');

const seed = async () => {
  const reset = process.argv.includes('--reset');

  try {
    await connectDB();

    if (reset) {
      await Promise.all([Booking.deleteMany({}), SeatHold.deleteMany({}), Counter.deleteMany({})]);
      console.log('Reset: bookings, seat holds and counters deleted.');
    }

    await Hall.bulkWrite([
      { updateOne: { filter: { hallId: hall.hallId }, update: { $set: hall }, upsert: true } },
    ]);

    await User.bulkWrite(
      users.map((user) => ({
        updateOne: { filter: { userId: user.userId }, update: { $set: user }, upsert: true },
      }))
    );

    await Showtime.bulkWrite(
      showtimes.map((showtime) => ({
        updateOne: {
          filter: { showtimeId: showtime.showtimeId },
          update: { $set: showtime },
          upsert: true,
        },
      }))
    );

    await Promise.all([Booking.init(), SeatHold.init()]);

    console.log(`Seeded: ${users.length} users, 1 hall (${hall.seats.length} seats), ${showtimes.length} showtimes.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();