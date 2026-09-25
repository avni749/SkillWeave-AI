import express from 'express';
import { updateComment, deleteComment } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

export default router;
