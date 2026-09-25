import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  createComment,
  getComments
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPost)
  .get(getPosts);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.route('/:id/like')
  .post(protect, likePost)
  .delete(protect, unlikePost);

router.route('/:id/comments')
  .post(protect, createComment)
  .get(getComments);

export default router;
