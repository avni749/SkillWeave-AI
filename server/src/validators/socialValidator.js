import { z } from 'zod';

export const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  parentCommentId: z.string().optional()
});
