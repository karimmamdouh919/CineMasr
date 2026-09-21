import express from 'express';
import {
  getSummaryStats,
  getRevenueByMovie,
  getRevenueByCinema
} from './admin.controller.js';

const router = express.Router();

router.get('/stats/summary', getSummaryStats);
router.get('/stats/revenue-by-movie', getRevenueByMovie);
router.get('/stats/revenue-by-cinema', getRevenueByCinema);

export default router;