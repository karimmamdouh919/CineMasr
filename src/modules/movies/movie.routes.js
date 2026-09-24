import { Router } from 'express';
import {
  getAllMovies,
  getNowShowing,
  getComingSoon,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from './movie.controller.js';

const router = Router();

// ── Read-only (public) ────────────────────────────────
router.get('/movies', getAllMovies);
router.get('/movies/now-showing', getNowShowing);
router.get('/movies/coming-soon', getComingSoon);
router.get('/movies/:id', getMovieById);

// ── Write (admin) ─────────────────────────────────────
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

export default router;
