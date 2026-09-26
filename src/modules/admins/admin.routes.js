import express from 'express';
import { protect, restrictTo } from '../../middlewares/Auth.Middleware.js';
import {
  getSummaryStats,
  getRevenueByMovie,
  getRevenueByCinema
} from './admin.controller.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats/summary', getSummaryStats);
router.get('/stats/revenue-by-movie', getRevenueByMovie);
router.get('/stats/revenue-by-cinema', getRevenueByCinema);

export default router;