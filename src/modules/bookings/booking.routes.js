import express from 'express';
import {
  holdSeats,
  checkout,
  getMyBookings,
  getBookingById,
  cancelBooking,
  handleWebhook,
  getAllBookings,
  renderConfirmationPage
} from './booking.controller.js';
import{protect} from '../../middlewares/Auth.Middleware.js'

const router = express.Router();

// User booking routes
router.post('/hold-seats', holdSeats);
router.post('/checkout', protect, checkout);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.get('/confirmation', renderConfirmationPage);
// Webhooks
router.post('/webhook', handleWebhook);

// Admin routes
router.get('/', getAllBookings);

export default router;