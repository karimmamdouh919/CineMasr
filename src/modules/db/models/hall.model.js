import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Hall 1"
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    theaterType: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterType', required: true },
    rows: { type: Number, required: true, min: 1 },
    seatsPerRow: { type: Number, required: true, min: 1 },
    totalSeats: { type: Number },
  },
  { timestamps: true }
);

hallSchema.pre('save', function (next) {
  this.totalSeats = this.rows * this.seatsPerRow;
  next();
});

export default mongoose.model('Hall', hallSchema);