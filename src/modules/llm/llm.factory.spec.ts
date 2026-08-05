// src/modules/llm/llm.factory.spec.ts
import { describe, expect, it } from 'vitest';
import { createLlmProvider } from './llm.factory.js';

describe('createLlmProvider', () => {
  it('selects openai provider', () => {
    expect(createLlmProvider('openai', 'key').name).toBe('openai');
  });

  it('selects gemini provider', () => {
    expect(createLlmProvider('gemini', 'key').name).toBe('gemini');
  });

  it('selects claude provider', () => {
    expect(createLlmProvider('claude', 'key').name).toBe('claude');
  });
});
