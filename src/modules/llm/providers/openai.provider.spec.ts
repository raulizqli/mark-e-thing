// src/modules/llm/providers/openai.provider.spec.ts
import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { OpenAiProvider } from './openai.provider.js';

describe('OpenAiProvider', () => {
  it('posts chat completions and returns content', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        choices: [{ message: { content: '{"summary":"ok"}' } }],
      },
    });
    const http = { post } as unknown as AxiosInstance;
    const provider = new OpenAiProvider('test-key', http);

    const content = await provider.complete([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'user' },
    ]);

    expect(content).toBe('{"summary":"ok"}');
    expect(post).toHaveBeenCalledWith(
      '/chat/completions',
      expect.objectContaining({
        response_format: { type: 'json_object' },
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );
  });
});
