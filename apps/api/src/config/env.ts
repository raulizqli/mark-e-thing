// apps/api/src/config/env.ts

import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CONTENT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_IMAGE_MODEL: z.string().default('dall-e-3'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  DEV_USER_ID: z.string().uuid(),
  DEV_USER_EMAIL: z.string().email(),
  DEV_USER_NAME: z.string().default('Demo User'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  N8N_WEBHOOK_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

export const hasOpenAiKey = Boolean(env.OPENAI_API_KEY?.trim());
