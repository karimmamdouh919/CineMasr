import express from 'express';
import {
  getAllSnacks,
  createSnack,
  updateSnack,
  deleteSnack
} from './snack.controller.js';

const router = express.Router();

router.get('/', getAllSnacks);

router.post('/', createSnack);
router.put('/:id', updateSnack);
router.delete('/:id', deleteSnack);

export default router;