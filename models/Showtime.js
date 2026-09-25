const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    showtimeId: { type: String, required: true, unique: true, trim: true },
    movieId: { type: String, required: true, trim: true },
    cinemaId: { type: String, required: true, trim: true },
    hallId: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "HH:mm"
    ticketPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);