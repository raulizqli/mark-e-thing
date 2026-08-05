// src/config/env.config.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  LLM_PROVIDER: z.enum(['openai', 'gemini', 'claude']).default('openai'),
  LLM_API_KEY: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  SUPABASE_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    'Missing or invalid environment configuration:',
    JSON.stringify(parsedEnv.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
