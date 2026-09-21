import express from 'express';
import {
  getAllCinemas,
  getCinemaById,
  getCinemaHalls,
  createCinema,
  updateCinema,
  deleteCinema,
  createHall,
  updateHall,
  deleteHall
} from './cinema.controller.js';

 const router = express.Router();

// Public routes
router.get('/', getAllCinemas);
router.get('/:id', getCinemaById);
router.get('/:cinemaId/halls', getCinemaHalls);

// Cinema Branch CRUD
router.post('/', createCinema);
router.put('/:id', updateCinema);
router.delete('/:id', deleteCinema);

// Hall CRUD
router.post('/:cinemaId/halls', createHall);
router.put('/halls/:hallId', updateHall);
router.delete('/halls/:hallId', deleteHall);

export default router;