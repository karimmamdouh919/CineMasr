const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // References
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true }, // Denormalized for branch revenue stats

  // TICKET SNAPSHOTS
  // Snapshot of each seat's calculated price at checkout
  tickets: [{
    seatNumber: { type: String, required: true }, // e.g., 'A1'
    seatType: { type: String, required: true },   // e.g., 'VIP', 'Standard'
    price: { type: Number, required: true }      // (Showtime Base Price) + (Seat Surcharge)
  }],

  // SNACK SNAPSHOTS
  snacks: [{
    snackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Snack', required: true },
    name: { type: String, required: true },       // Snapshot of name
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }   // Snapshot of unit price
  }],

  // FINANCIAL BREAKDOWN
  ticketsSubtotal: { type: Number, required: true }, // Sum of tickets
  snacksSubtotal: { type: Number, required: true },  // Sum of snacks
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },      // Applied promo/coupon code
  totalAmount: { type: Number, required: true },     // Grand total charged to customer

  currency: { type: String, default: 'USD' },

  // PAYMENT & GATEWAY METADATA
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  paymentMethod: { type: String, enum: ['card', 'cash', 'wallet'], default: 'card' },
  transactionId: { type: String }, // Returned by Stripe/Paymob/Paypal webhook

  refundDetails: {
    refundedAt: { type: Date },
    refundAmount: { type: Number },
    reason: { type: String }
  }
}, { timestamps: true });
orderSchema.index({ userId: 1, createdAt: -1 });
export const orderModel = mongoose.model('Order', orderSchema);

