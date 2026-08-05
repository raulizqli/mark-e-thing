// src/shared/testing/test-setup.ts
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT ?? '3000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/prospect_finder_test?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
process.env.GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ?? 'test-google-places-key';
process.env.LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'openai';
process.env.LLM_API_KEY = process.env.LLM_API_KEY ?? 'test-llm-api-key';
process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS ?? '900000';
process.env.RATE_LIMIT_MAX_REQUESTS =
  process.env.RATE_LIMIT_MAX_REQUESTS ?? '100';
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL ?? 'https://example.supabase.co';
process.env.SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET ?? 'test-supabase-jwt-secret-at-least-32-chars';
