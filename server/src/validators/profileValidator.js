import { z } from 'zod';

export const profileSchema = z.object({
  bio: z.string().optional(),
  profilePicture: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  targetRole: z.string().optional(),
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    level: z.string().optional()
  })).optional()
});
