const mongoose = require('mongoose');

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true, trim: true, uppercase: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    userId: { type: String, required: true, index: true },
    showtimeId: { type: String, required: true },
    seats: {
      type: [seatSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'A booking must contain at least one seat.',
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending', index: true },
    isActive: { type: Boolean, default: true },
    bookingDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.isActive;
        return ret;
      },
    },
  }
);

bookingSchema.index(
  { showtimeId: 1, 'seats.seatNumber': 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_seat_per_showtime',
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;