import { z } from 'zod';

export const saveSchema = z.object({
  malId: z.string().min(1, 'MAL ID is required').transform(Number),
  status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLANNING']).default('PLANNING'),
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  eps_watched: z.number().int().optional().default(0),
  score: z.number().int().min(0).max(10)
});

export type SaveSchema = typeof saveSchema;
