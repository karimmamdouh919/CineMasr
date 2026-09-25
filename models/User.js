const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);