import express from 'express';
import {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
} from './showtime.controller.js';

 const router = express.Router();

// Public routes
router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);

// Admin routes
router.post('/', createShowtime);
router.put('/:id', updateShowtime);
router.delete('/:id', deleteShowtime);

export default router;