const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  category: { 
    type: String, 
    enum: ['Popcorn', 'Beverage', 'Candy', 'Combos', 'Nachos'], 
    required: true,
    default: 'Popcorn'
  }
}, { timestamps: true });

export const snackModel = mongoose.model('Snack', snackSchema);
