import express from 'express';
import {
  getSummaryStats,
  getRevenueByMovie,
  getRevenueByCinema
} from './admin.controller.js';

const router = express.Router();

router.get('/admin/stats/summary', getSummaryStats);
router.get('/admin/stats/revenue-by-movie', getRevenueByMovie);
router.get('/admin/stats/revenue-by-cinema', getRevenueByCinema);

export default router;