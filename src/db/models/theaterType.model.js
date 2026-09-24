import mongoose from 'mongoose';

const theaterTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater type name is required'],
      unique: true,
      trim: true,
      // e.g. Standard, VIP, IMAX, 4DX, Premium
    },
    extraPrice: {
      type: Number,
      default: 0,
      min: [0, 'Extra price cannot be negative'],
    },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('TheaterType', theaterTypeSchema);
