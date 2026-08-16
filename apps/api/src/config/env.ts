// apps/api/src/config/env.ts

import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  AI_CONTENT_PROVIDER: z.enum(['gemini', 'groq', 'openai', 'mock', 'auto']).default('auto'),
  AI_IMAGE_PROVIDER: z
    .enum(['gemini', 'together', 'openai', 'mock', 'auto'])
    .default('auto'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CONTENT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_IMAGE_MODEL: z.string().default('dall-e-3'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_CONTENT_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_IMAGE_MODEL: z.string().default('gemini-2.0-flash-preview-image-generation'),
  GROQ_API_KEY: z.string().optional(),
  GROQ_CONTENT_MODEL: z.string().default('llama-3.3-70b-versatile'),
  TOGETHER_API_KEY: z.string().optional(),
  TOGETHER_IMAGE_MODEL: z.string().default('black-forest-labs/FLUX.1-schnell'),
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

function isUsableKey(value: string | undefined): boolean {
  const raw = value?.trim() ?? '';
  return Boolean(raw && raw !== 'sk-...' && !raw.includes('your_') && raw !== '...');
}

export const hasOpenAiKey = isUsableKey(env.OPENAI_API_KEY);
export const hasGeminiKey = isUsableKey(env.GEMINI_API_KEY);
export const hasGroqKey = isUsableKey(env.GROQ_API_KEY);
export const hasTogetherKey = isUsableKey(env.TOGETHER_API_KEY);
