// src/modules/search/search.dto.ts
import { z } from 'zod';

export const createSearchSchema = z.object({
  category: z.string().min(1),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().positive().max(50_000).default(2000),
});

export type CreateSearchDto = z.infer<typeof createSearchSchema>;

export const searchIdParamsSchema = z.object({
  id: z.string().uuid(),
});
