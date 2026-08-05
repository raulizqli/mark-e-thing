// apps/api/src/infrastructure/ai/ai.factory.ts

import { hasOpenAiKey } from '../../config/env';
import type { ContentGeneratorPort } from '@domain/services/content-generator.port';
import type { ImageGeneratorPort } from '@domain/services/image-generator.port';
import { MockContentGenerator } from './mock-content.generator';
import { MockImageGenerator } from './mock-image.generator';
import { OpenAiContentGenerator } from './openai-content.generator';
import { OpenAiImageGenerator } from './openai-image.generator';

export function createContentGenerator(): ContentGeneratorPort {
  return hasOpenAiKey ? new OpenAiContentGenerator() : new MockContentGenerator();
}

export function createImageGenerator(): ImageGeneratorPort {
  return hasOpenAiKey ? new OpenAiImageGenerator() : new MockImageGenerator();
}
