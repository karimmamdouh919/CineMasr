const express = require('express');
const requireInternalKey = require('../middleware/internalKey');
const {
  getShowtimeSeats,
  createBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
  updateBooking,
  cancelBooking,
  updatePaymentStatus,
} = require('../controllers/bookingController');

const router = express.Router();

// Seats
router.get('/showtimes/:showtimeId/seats', getShowtimeSeats);

// Bookings
router.post('/bookings', createBooking);
router.get('/bookings', getAllBookings);
router.get('/bookings/user/:userId', getUserBookings); // must stay above "/bookings/:id"
router.get('/bookings/:id', getBookingById);

// Internal: only the Payment backend (holding the internal key) may call this
router.patch('/bookings/:id/payment-status', requireInternalKey, updatePaymentStatus);

router.patch('/bookings/:id', updateBooking);
router.delete('/bookings/:id', cancelBooking);

module.exports = router;