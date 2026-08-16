// apps/api/vitest.setup.ts

process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/markething';
process.env.DEV_USER_ID ??= '00000000-0000-4000-8000-000000000001';
process.env.DEV_USER_EMAIL ??= 'demo@markething.app';
process.env.DEV_USER_NAME ??= 'Demo User';
process.env.WEB_URL ??= 'http://localhost:3000';
process.env.AI_CONTENT_PROVIDER ??= 'mock';
process.env.AI_IMAGE_PROVIDER ??= 'mock';
