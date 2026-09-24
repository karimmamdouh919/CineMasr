import { Router } from 'express';
import {
  getAllShowtimes,
  getShowtimeById,
  getShowtimesByMovie,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  bookSeats,
} from './showtime.controller.js';

const router = Router();

// ── Read (public) ─────────────────────────────────────
router.get('/showtimes', getAllShowtimes);
router.get('/showtimes/:id', getShowtimeById);

// Nested: get all showtimes for a specific movie
router.get('/movies/:movieId/showtimes', getShowtimesByMovie);

// ── Write (admin) ─────────────────────────────────────
router.post('/showtimes', createShowtime);
router.put('/showtimes/:id', updateShowtime);
router.delete('/showtimes/:id', deleteShowtime);

// ── Booking flow ──────────────────────────────────────
// Called internally by the booking module to reserve seats
router.patch('/showtimes/:id/book-seats', bookSeats);

export default router;
