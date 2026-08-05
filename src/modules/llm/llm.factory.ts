// src/modules/llm/llm.factory.ts
import { env } from '../../config/env.config.js';
import type { LlmProvider } from './llm-provider.interface.js';
import { ClaudeProvider } from './providers/claude.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { OpenAiProvider } from './providers/openai.provider.js';

export function createLlmProvider(
  providerName: typeof env.LLM_PROVIDER = env.LLM_PROVIDER,
  apiKey: string = env.LLM_API_KEY,
): LlmProvider {
  switch (providerName) {
    case 'openai':
      return new OpenAiProvider(apiKey);
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'claude':
      return new ClaudeProvider(apiKey);
    default: {
      const exhaustive: never = providerName;
      throw new Error(`Unsupported LLM provider: ${String(exhaustive)}`);
    }
  }
}
