import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from './user.controller.js';

 const router = express.Router();

// User routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;