import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  runningTime: { type: Number, required: true }, // In minutes
  genres: [{ type: String }], // e.g., ['Action', 'Sci-Fi']
  releaseDate: { type: Date, required: true },
  ageRating: { type: String },
  starring: [{type: String}],
  posterUrl: { type: String },
  trailerUrl: { type: String },
  status: { 
  type: String, 
  enum: ['Now Showing', 'Coming Soon', 'Archived'], 
  default: 'Now Showing' 
  }
}, { timestamps: true });

export const movieModel = mongoose.model('Movie', movieSchema);
