import { Router } from 'express';
import {
  getAllTheaterTypes,
  getTheaterTypeById,
  createTheaterType,
  updateTheaterType,
  deleteTheaterType,
} from './theaterType.controller.js';

const router = Router();

router.get('/theater-types', getAllTheaterTypes);
router.get('/theater-types/:id', getTheaterTypeById);
router.post('/theater-types', createTheaterType);
router.put('/theater-types/:id', updateTheaterType);
router.delete('/theater-types/:id', deleteTheaterType);

export default router;
