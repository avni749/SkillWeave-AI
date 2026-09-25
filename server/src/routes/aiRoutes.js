import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  analyzeProfile,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis
} from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Strict rate limiting for AI analysis to prevent abuse and API cost overruns
// Limit each user to 5 requests per hour
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: { success: false, message: 'Too many analysis requests from this IP. Please try again after an hour.' }
});

router.post('/profile-analysis', protect, aiLimiter, analyzeProfile);
router.get('/profile-analysis/history', protect, getAnalysisHistory);
router.get('/profile-analysis/:id', protect, getAnalysisById);
router.delete('/profile-analysis/:id', protect, deleteAnalysis);

export default router;
