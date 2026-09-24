import express from 'express';
import { protect, authorizeRoles } from '../../middlewares/Auth.Middlware.js';
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
router.get('/', authorizeRoles('admin'), getAllUsers);
router.get('/:id', authorizeRoles('admin'), getUserById);
router.put('/:id/role', authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;