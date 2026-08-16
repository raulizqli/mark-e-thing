// apps/api/src/infrastructure/ai/ai.factory.ts

import {
  env,
  hasGeminiKey,
  hasGroqKey,
  hasOpenAiKey,
  hasTogetherKey,
} from '../../config/env';
import type { ContentGeneratorPort } from '@domain/services/content-generator.port';
import type { ImageGeneratorPort } from '@domain/services/image-generator.port';
import { GeminiContentGenerator } from './gemini-content.generator';
import { GeminiImageGenerator } from './gemini-image.generator';
import { GroqContentGenerator } from './groq-content.generator';
import { MockContentGenerator } from './mock-content.generator';
import { MockImageGenerator } from './mock-image.generator';
import { OpenAiContentGenerator } from './openai-content.generator';
import { OpenAiImageGenerator } from './openai-image.generator';
import { TogetherImageGenerator } from './together-image.generator';

function resolveContentProvider(): 'gemini' | 'groq' | 'openai' | 'mock' {
  const configured = env.AI_CONTENT_PROVIDER;
  if (configured === 'mock') return 'mock';
  if (configured === 'gemini') {
    if (!hasGeminiKey) throw new Error('AI_CONTENT_PROVIDER=gemini requires GEMINI_API_KEY');
    return 'gemini';
  }
  if (configured === 'groq') {
    if (!hasGroqKey) throw new Error('AI_CONTENT_PROVIDER=groq requires GROQ_API_KEY');
    return 'groq';
  }
  if (configured === 'openai') {
    if (!hasOpenAiKey) throw new Error('AI_CONTENT_PROVIDER=openai requires OPENAI_API_KEY');
    return 'openai';
  }

  // auto: prefer free/cheap providers, then OpenAI, else mock
  if (hasGeminiKey) return 'gemini';
  if (hasGroqKey) return 'groq';
  if (hasOpenAiKey) return 'openai';
  return 'mock';
}

function resolveImageProvider(): 'gemini' | 'together' | 'openai' | 'mock' {
  const configured = env.AI_IMAGE_PROVIDER;
  if (configured === 'mock') return 'mock';
  if (configured === 'gemini') {
    if (!hasGeminiKey) throw new Error('AI_IMAGE_PROVIDER=gemini requires GEMINI_API_KEY');
    return 'gemini';
  }
  if (configured === 'together') {
    if (!hasTogetherKey) throw new Error('AI_IMAGE_PROVIDER=together requires TOGETHER_API_KEY');
    return 'together';
  }
  if (configured === 'openai') {
    if (!hasOpenAiKey) throw new Error('AI_IMAGE_PROVIDER=openai requires OPENAI_API_KEY');
    return 'openai';
  }

  // auto: prefer Together (cheap FLUX), then Gemini image, then OpenAI, else mock
  if (hasTogetherKey) return 'together';
  if (hasGeminiKey) return 'gemini';
  if (hasOpenAiKey) return 'openai';
  return 'mock';
}

export function createContentGenerator(): ContentGeneratorPort {
  switch (resolveContentProvider()) {
    case 'gemini':
      return new GeminiContentGenerator();
    case 'groq':
      return new GroqContentGenerator();
    case 'openai':
      return new OpenAiContentGenerator();
    case 'mock':
    default:
      return new MockContentGenerator();
  }
}

export function createImageGenerator(): ImageGeneratorPort {
  switch (resolveImageProvider()) {
    case 'gemini':
      return new GeminiImageGenerator();
    case 'together':
      return new TogetherImageGenerator();
    case 'openai':
      return new OpenAiImageGenerator();
    case 'mock':
    default:
      return new MockImageGenerator();
  }
}

export { resolveContentProvider, resolveImageProvider };
