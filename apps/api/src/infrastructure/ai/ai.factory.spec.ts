// apps/api/src/infrastructure/ai/ai.factory.spec.ts

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ai.factory provider resolution', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('falls back to mock when no provider keys are set', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/markething');
    vi.stubEnv('DEV_USER_ID', '00000000-0000-4000-8000-000000000001');
    vi.stubEnv('DEV_USER_EMAIL', 'demo@markething.app');
    vi.stubEnv('AI_CONTENT_PROVIDER', 'auto');
    vi.stubEnv('AI_IMAGE_PROVIDER', 'auto');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv('TOGETHER_API_KEY', '');

    const { createContentGenerator, createImageGenerator, resolveContentProvider, resolveImageProvider } =
      await import('./ai.factory');

    expect(resolveContentProvider()).toBe('mock');
    expect(resolveImageProvider()).toBe('mock');
    expect(createContentGenerator().constructor.name).toBe('MockContentGenerator');
    expect(createImageGenerator().constructor.name).toBe('MockImageGenerator');
  });

  it('prefers gemini content and together image in auto mode when keys exist', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/markething');
    vi.stubEnv('DEV_USER_ID', '00000000-0000-4000-8000-000000000001');
    vi.stubEnv('DEV_USER_EMAIL', 'demo@markething.app');
    vi.stubEnv('AI_CONTENT_PROVIDER', 'auto');
    vi.stubEnv('AI_IMAGE_PROVIDER', 'auto');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-test-key');
    vi.stubEnv('TOGETHER_API_KEY', 'together-test-key');
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai-test');

    const { resolveContentProvider, resolveImageProvider } = await import('./ai.factory');

    expect(resolveContentProvider()).toBe('gemini');
    expect(resolveImageProvider()).toBe('together');
  });
});
