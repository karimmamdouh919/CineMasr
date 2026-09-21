import express from 'express';
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from './movie.controller.js';

 const router = express.Router();

// Public routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Admin routes
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;