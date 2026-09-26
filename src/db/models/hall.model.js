import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g., "A1", "A2", "C5"
  row: { type: String, required: true },        // e.g., "A"
  column: { type: Number, required: true },     // e.g., 1
  type: { 
    type: String, 
    enum: ['Standard', 'VIP', 'Wheelchair', 'Blocked'], 
    default: 'Standard' 
  },
  // VIP seats cost extra (e.g., 1.3 = 30% price markup over showtime base price)
  priceMultiplier: { type: Number, default: 1.0 }
}, { _id: false });

const hallSchema = new mongoose.Schema({
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  name: { type: String, required: true }, // e.g., "Hall 1"
  type: { type: String, enum: ['Standard', 'IMAX', '4DX', 'VIP'], required: true },
  
  // Matrix dimensions for UI rendering
  totalRows: { type: Number, required: true }, // e.g., 10 rows (A through J)
  totalCols: { type: Number, required: true }, // e.g., 12 columns (1 through 12)
  
  // Full array of physical seats
  seats: [seatSchema],
  supportedFormats: [{ 
    type: String, 
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos', 'Gold'] 
  }]
}, { timestamps: true });

export const hallModel = mongoose.model('Hall', hallSchema);