const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  format: { type: String, required: true },
  price: { type: Number, required: true }, // Base ticket price (e.g., $10)
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  attributes: [
    { 
      type: String, 
      enum: ['2D', '3D', 'IMAX', 'Dolby Cinema', '4DX', 'ScreenX', 'Dolby Atmos', 'VIP'] 
    }
  ],
  // List of seatNumbers already booked for this showtime
  bookedSeats: [{ type: String }],
  // Add to showtimeSchema
  tempSeatHolds: [{
    seatNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true } // Auto-expire after 5–10 minutes
  }]
}, { timestamps: true });
showtimeSchema.index({ cinemaId: 1, movieId: 1, startTime: 1 });
export const showtimeModel = mongoose.model('Showtime', showtimeSchema);
