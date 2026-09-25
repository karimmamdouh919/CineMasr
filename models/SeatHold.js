const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema(
  {
    showtimeId: { type: String, required: true, trim: true },
    seatNumber: { type: String, required: true, trim: true, uppercase: true },
    userId: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

seatHoldSchema.index({ showtimeId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatHold', seatHoldSchema);