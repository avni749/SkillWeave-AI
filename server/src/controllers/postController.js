import prisma from '../config/prisma.js';
import { postSchema, commentSchema } from '../validators/socialValidator.js';

export const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = postSchema.parse(req.body);
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: req.user.id
      }
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await prisma.post.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, profile: { select: { profilePicture: true } } } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    const total = await prisma.post.count();
    
    res.status(200).json({ success: true, posts, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, profile: { select: { profilePicture: true } } } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    // Check if user liked it (if authenticated)
    let isLiked = false;
    if (req.user) {
      const like = await prisma.like.findUnique({ where: { postId_authorId: { postId: post.id, authorId: req.user.id } } });
      if (like) isLiked = true;
    }
    
    res.status(200).json({ success: true, post, isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { content, imageUrl } = postSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: { content, imageUrl }
    });
    res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- LIKES ---

export const likePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existingLike = await prisma.like.findUnique({
      where: { postId_authorId: { postId, authorId: req.user.id } }
    });
    
    if (existingLike) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    await prisma.like.create({
      data: { postId, authorId: req.user.id }
    });
    
    const likeCount = await prisma.like.count({ where: { postId } });
    res.status(200).json({ success: true, message: 'Post liked', likeCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const existingLike = await prisma.like.findUnique({
      where: { postId_authorId: { postId, authorId: req.user.id } }
    });
    
    if (!existingLike) {
      return res.status(400).json({ success: false, message: 'Has not been liked' });
    }

    await prisma.like.delete({
      where: { postId_authorId: { postId, authorId: req.user.id } }
    });
    
    const likeCount = await prisma.like.count({ where: { postId } });
    res.status(200).json({ success: true, message: 'Post unliked', likeCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- COMMENTS ---

export const createComment = async (req, res) => {
  try {
    const { content, parentCommentId } = commentSchema.parse(req.body);
    const { id: postId } = req.params;
    
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    if (parentCommentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } });
      if (!parent || parent.postId !== postId) {
        return res.status(400).json({ success: false, message: 'Invalid parent comment' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.id,
        parentCommentId
      }
    });
    res.status(201).json({ success: true, comment });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    // For simplicity, returning top level comments and nesting replies
    const comments = await prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, profile: { select: { profilePicture: true } } } },
        replies: {
          include: {
            author: { select: { id: true, name: true, profile: { select: { profilePicture: true } } } }
          }
        }
      }
    });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = commentSchema.parse(req.body);
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.authorId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updatedComment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { content }
    });
    res.status(200).json({ success: true, comment: updatedComment });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.authorId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
