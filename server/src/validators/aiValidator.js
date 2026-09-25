import { z } from 'zod';

export const profileAnalysisSchema = z.object({
  targetRole: z.string().min(2, 'Target role must be at least 2 characters'),
  careerGoals: z.string().min(10, 'Please provide more details about your career goals').optional(),
  projects: z.string().optional() // Can be passed directly if not completely covered by the profile
});
