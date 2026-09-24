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
router.post('/booking/hold-seats', holdSeats);
router.post('/booking/checkout', checkout);
router.get('/booking/my-bookings', getMyBookings);
router.get('/booking/:id', getBookingById);
router.patch('/booking/:id/cancel', cancelBooking);

// Webhooks
router.post('/booking/webhook', handleWebhook);

// Admin routes
router.get('/booking', getAllBookings);

export default router;