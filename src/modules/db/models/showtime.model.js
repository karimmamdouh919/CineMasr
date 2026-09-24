import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "18:30"
    endTime: { type: String },
    price: { type: Number, required: true, min: 0 },
    language: { type: String },
    subtitle: { type: String },
  },
  { timestamps: true }
);

// Speeds up the common "movie + cinema + date" lookup used by the frontend
showtimeSchema.index({ movie: 1, cinema: 1, date: 1 });

export default mongoose.model('Showtime', showtimeSchema);
