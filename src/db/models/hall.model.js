import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hall name is required'],
      trim: true,
      // e.g. "Hall 1", "Hall A", "IMAX Hall"
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
    },
    theaterType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TheaterType',
      required: [true, 'Theater type is required'],
    },
    rows: {
      type: Number,
      required: [true, 'Number of rows is required'],
      min: [1, 'Must have at least 1 row'],
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Seats per row is required'],
      min: [1, 'Must have at least 1 seat per row'],
    },
    totalSeats: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate totalSeats before saving
hallSchema.pre('save', function (next) {
  this.totalSeats = this.rows * this.seatsPerRow;
  next();
});

export default mongoose.model('Hall', hallSchema);
