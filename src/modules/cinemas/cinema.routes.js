import { Router } from 'express';
import {
  getAllCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
} from './cinema.controller.js';

const router = Router();

router.get('/cinemas', getAllCinemas);
router.get('/cinemas/:id', getCinemaById);
router.post('/cinemas', createCinema);
router.put('/cinemas/:id', updateCinema);
router.delete('/cinemas/:id', deleteCinema);

export default router;
