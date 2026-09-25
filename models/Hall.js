const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema(
  {
    hallId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    seats: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hall', hallSchema);