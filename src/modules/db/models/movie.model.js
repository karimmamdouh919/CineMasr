import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
    duration: { type: Number, required: true }, // in minutes
    language: { type: String, required: true },
    subtitles: [{ type: String }],
    releaseDate: { type: Date, required: true },
    poster: { type: String },
    trailerUrl: { type: String },
    cast: [{ type: String }],
    director: { type: String },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    ageRating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', '18+'], default: 'PG-13' },
    status: { type: String, enum: ['coming_soon', 'now_showing', 'ended'], default: 'coming_soon' },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text' });

export default mongoose.model('Movie', movieSchema);

