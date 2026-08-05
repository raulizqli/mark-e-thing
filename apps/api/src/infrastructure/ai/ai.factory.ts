// apps/api/src/infrastructure/ai/ai.factory.ts

import { hasAnthropicKey, hasGoogleAiKey, hasOpenAiKey } from '../../config/env';
import type { AiGatewayPort } from '@domain/services/ai-gateway.port';
import type { ContentGeneratorPort } from '@domain/services/content-generator.port';
import type { ImageGeneratorPort } from '@domain/services/image-generator.port';
import { AiGatewayService } from './gateway/ai-gateway.service';
import { ProviderRegistry } from './gateway/provider-registry';
import { GatewayContentGenerator } from './gateway-content.generator';
import { GatewayImageGenerator } from './gateway-image.generator';
import { AnthropicLlmProvider } from './providers/anthropic-llm.provider';
import { GeminiImageProvider } from './providers/gemini-image.provider';
import { GeminiLlmProvider } from './providers/gemini-llm.provider';
import { MockImageProvider } from './providers/mock-image.provider';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { OpenAiImageProvider } from './providers/openai-image.provider';
import { OpenAiLlmProvider } from './providers/openai-llm.provider';

function createProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();

  if (hasOpenAiKey) {
    registry.registerLlm(new OpenAiLlmProvider());
    registry.registerImage(new OpenAiImageProvider());
  }

  if (hasAnthropicKey) {
    registry.registerLlm(new AnthropicLlmProvider());
  }

  if (hasGoogleAiKey) {
    registry.registerLlm(new GeminiLlmProvider());
    registry.registerImage(new GeminiImageProvider());
  }

  registry.registerLlm(new MockLlmProvider());
  registry.registerImage(new MockImageProvider());

  return registry;
}

export function createAiGateway(): AiGatewayPort {
  return new AiGatewayService(createProviderRegistry());
}

export function createContentGenerator(gateway?: AiGatewayPort): ContentGeneratorPort {
  return new GatewayContentGenerator(gateway ?? createAiGateway());
}

export function createImageGenerator(gateway?: AiGatewayPort): ImageGeneratorPort {
  return new GatewayImageGenerator(gateway ?? createAiGateway());
}
