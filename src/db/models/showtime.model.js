import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema is required'],
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: [true, 'Hall is required'],
    },
    date: {
      type: Date,
      required: [true, 'Showtime date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      // e.g. "18:30"
    },
    endTime: {
      type: String,
      // auto-calculated or manually set
    },
    price: {
      type: Number,
      required: [true, 'Base ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },
    language: { type: String },
    subtitle: { type: String },

    // Tracks which seats are booked — e.g. ["A1", "A2", "B5"]
    bookedSeats: [{ type: String }],

    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

// Index for fast "movie + cinema + date" frontend lookups
showtimeSchema.index({ movie: 1, cinema: 1, date: 1 });
showtimeSchema.index({ date: 1, status: 1 });

export default mongoose.model('Showtime', showtimeSchema);
