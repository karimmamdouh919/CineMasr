import mongoose from 'mongoose';

const theaterTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. Standard, VIP, IMAX, 4DX
    extraPrice: { type: Number, default: 0, min: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('TheaterType', theaterTypeSchema);
