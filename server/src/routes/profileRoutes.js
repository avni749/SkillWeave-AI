import express from 'express';
import {
  createProfile,
  getMe,
  updateProfile,
  getProfileById,
  searchProfiles
} from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createProfile);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/search', searchProfiles);
router.get('/:userId', getProfileById);

export default router;
