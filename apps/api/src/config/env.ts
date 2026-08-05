// apps/api/src/config/env.ts

import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { AiProviderName } from '@domain/services/ai-gateway.port';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../../.env') });

const aiProviderSchema = z.enum(['openai', 'anthropic', 'gemini', 'mock']);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CONTENT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_IMAGE_MODEL: z.string().default('dall-e-3'),
  AI_CONTENT_PROVIDER: aiProviderSchema.default('openai'),
  AI_CONTENT_MODEL: z.string().optional(),
  AI_IMAGE_PROVIDER: aiProviderSchema.optional(),
  AI_IMAGE_MODEL: z.string().optional(),
  AI_REASONING_PROVIDER: aiProviderSchema.optional(),
  AI_REASONING_MODEL: z.string().optional(),
  AI_FALLBACK_PROVIDER: aiProviderSchema.optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
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

function isValidApiKey(key: string | undefined): boolean {
  const raw = key?.trim() ?? '';
  return Boolean(raw && raw !== 'sk-...' && !raw.includes('your_'));
}

export const hasOpenAiKey = isValidApiKey(env.OPENAI_API_KEY);
export const hasAnthropicKey = isValidApiKey(env.ANTHROPIC_API_KEY);
export const hasGoogleAiKey = isValidApiKey(env.GOOGLE_AI_API_KEY);

export function isProviderConfigured(name: AiProviderName): boolean {
  switch (name) {
    case 'openai':
      return hasOpenAiKey;
    case 'anthropic':
      return hasAnthropicKey;
    case 'gemini':
      return hasGoogleAiKey;
    case 'mock':
      return true;
    default:
      return false;
  }
}
