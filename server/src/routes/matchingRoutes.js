import express from 'express';
import {
  updatePreferences,
  getPreferences,
  getRecommendations,
  sendRequest,
  acceptRequest,
  rejectRequest,
  getIncomingRequests,
  getOutgoingRequests
} from '../controllers/matchingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All matching routes require authentication

router.route('/preferences')
  .get(getPreferences)
  .post(updatePreferences)
  .put(updatePreferences);

router.get('/recommendations', getRecommendations);

router.post('/requests/:receiverId', sendRequest);
router.put('/requests/:requestId/accept', acceptRequest);
router.put('/requests/:requestId/reject', rejectRequest);
router.get('/requests/incoming', getIncomingRequests);
router.get('/requests/outgoing', getOutgoingRequests);

export default router;
