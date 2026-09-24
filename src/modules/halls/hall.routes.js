import { Router } from 'express';
import {
  getHallsByCinema,
  getHallById,
  getHallSeatMap,
  createHall,
  updateHall,
  deleteHall,
} from './hall.controller.js';

const router = Router();

// Nested under cinema
router.get('/cinemas/:cinemaId/halls', getHallsByCinema);
router.post('/cinemas/:cinemaId/halls', createHall);

// Standalone hall routes
router.get('/halls/:id', getHallById);
router.get('/halls/:id/seat-map', getHallSeatMap);   // ?showtimeId=<id>
router.put('/halls/:id', updateHall);
router.delete('/halls/:id', deleteHall);

export default router;
