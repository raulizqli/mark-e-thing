// apps/api/src/infrastructure/ai/ai.factory.ts

import { hasOpenAiKey } from '../../config/env.js';
import type { ContentGeneratorPort } from '@domain/services/content-generator.port.js';
import type { ImageGeneratorPort } from '@domain/services/image-generator.port.js';
import { MockContentGenerator } from './mock-content.generator.js';
import { MockImageGenerator } from './mock-image.generator.js';
import { OpenAiContentGenerator } from './openai-content.generator.js';
import { OpenAiImageGenerator } from './openai-image.generator.js';

export function createContentGenerator(): ContentGeneratorPort {
  return hasOpenAiKey ? new OpenAiContentGenerator() : new MockContentGenerator();
}

export function createImageGenerator(): ImageGeneratorPort {
  return hasOpenAiKey ? new OpenAiImageGenerator() : new MockImageGenerator();
}
