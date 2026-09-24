  import express from 'express';
import { protect, restrictTo } from '../../middlewares/Auth.Middleware.js';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from './user.controller.js';

const router = express.Router();

router.use(protect);

// User routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin only routes
router.get('/', restrictTo('admin'), getAllUsers);
router.get('/:id', restrictTo('admin'), getUserById);
router.put('/:id/role', restrictTo('admin'), updateUserRole);
router.delete('/:id', restrictTo('admin'), deleteUser);

export default router;