import { z } from 'zod';

export const collaborationPreferenceSchema = z.object({
  lookingForSkills: z.array(z.string()).optional().default([]),
  preferredTechs: z.array(z.string()).optional().default([]),
  projectInterests: z.array(z.string()).optional().default([]),
  collaborationGoals: z.array(z.string()).optional().default([]),
  preferredTeamRoles: z.array(z.string()).optional().default([])
});
