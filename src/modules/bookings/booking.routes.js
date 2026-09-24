import express from 'express';
import {
  holdSeats,
  checkout,
  getMyBookings,
  getBookingById,
  cancelBooking,
  handleWebhook,
  getAllBookings
} from './booking.controller.js';

const router = express.Router();

// User booking routes
router.post('/hold-seats', holdSeats);
router.post('/checkout', checkout);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

// Webhooks
router.post('/webhook', handleWebhook);

// Admin routes
router.get('/', getAllBookings);

export default router;