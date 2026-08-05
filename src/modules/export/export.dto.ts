// src/modules/export/export.dto.ts
import { z } from 'zod';

export const exportParamsSchema = z.object({
  id: z.string().uuid(),
});

export const exportQuerySchema = z.object({
  format: z.enum(['csv', 'excel', 'json']).default('json'),
});
