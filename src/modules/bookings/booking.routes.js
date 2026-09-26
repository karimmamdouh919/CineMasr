import express from 'express';
import {
  holdSeats,
  checkout,
  getMyBookings,
  getBookingById,
  cancelBooking,
  handleWebhook,
  getAllBookings,
  renderConfirmationPage,
  deleteBooking,
  updateBooking
} from './booking.controller.js';
import{protect} from '../../middlewares/Auth.Middleware.js'

const router = express.Router();

// User booking routes
router.post('/hold-seats', holdSeats);
router.get('/my-bookings', protect, getMyBookings);
router.post('/checkout', protect, checkout);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.get('/confirmation', renderConfirmationPage);
// Webhooks
router.post('/webhook', handleWebhook);

// Admin routes
router.get('/', getAllBookings);
router.delete('/:id', deleteBooking);
router.put('/:id', updateBooking);



export default router;