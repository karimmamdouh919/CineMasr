import mongoose from 'mongoose'
// Cinema.js (Branch)
const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

export const cinemaModel = mongoose.model('Cinema', cinemaSchema);
