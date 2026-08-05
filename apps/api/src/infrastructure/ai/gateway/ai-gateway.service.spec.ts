// apps/api/src/infrastructure/ai/gateway/ai-gateway.service.spec.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AiCompletionRequest,
  AiImageRequest,
  AiProviderName,
} from '@domain/services/ai-gateway.port';
import type { ImageProvider } from '../providers/image-provider.interface';
import type { LlmProvider } from '../providers/llm-provider.interface';
import { AiGatewayService } from './ai-gateway.service';
import { ProviderRegistry } from './provider-registry';

const envState = vi.hoisted(() => ({
  AI_CONTENT_PROVIDER: 'openai' as AiProviderName,
  AI_CONTENT_MODEL: undefined as string | undefined,
  AI_IMAGE_PROVIDER: undefined as AiProviderName | undefined,
  AI_IMAGE_MODEL: undefined as string | undefined,
  AI_REASONING_PROVIDER: undefined as AiProviderName | undefined,
  AI_REASONING_MODEL: undefined as string | undefined,
  AI_FALLBACK_PROVIDER: undefined as AiProviderName | undefined,
  OPENAI_CONTENT_MODEL: 'gpt-4o-mini',
  OPENAI_IMAGE_MODEL: 'dall-e-3',
}));

const configuredProviders = vi.hoisted(() => new Set<AiProviderName>(['mock']));

vi.mock('../../../config/env', () => ({
  env: envState,
  isProviderConfigured: (name: AiProviderName) => configuredProviders.has(name),
}));

class FailingLlmProvider implements LlmProvider {
  readonly name = 'openai' as const;

  async complete() {
    throw new Error('primary provider failed');
  }
}

class SuccessLlmProvider implements LlmProvider {
  readonly name: AiProviderName;

  constructor(name: AiProviderName, text = '{"title":"ok"}') {
    this.name = name;
    this.text = text;
  }

  private readonly text: string;

  async complete() {
    return { text: this.text, usage: { totalTokens: 42 } };
  }
}

class FailingImageProvider implements ImageProvider {
  readonly name = 'openai' as const;

  async generate() {
    throw new Error('primary image provider failed');
  }
}

class SuccessImageProvider implements ImageProvider {
  readonly name: AiProviderName;

  constructor(name: AiProviderName) {
    this.name = name;
  }

  async generate() {
    return {
      imageBuffer: Buffer.from('mock-image'),
      mimeType: 'image/png',
    };
  }
}

describe('AiGatewayService', () => {
  beforeEach(() => {
    configuredProviders.clear();
    configuredProviders.add('mock');
    envState.AI_CONTENT_PROVIDER = 'openai';
    envState.AI_FALLBACK_PROVIDER = undefined;
    envState.AI_IMAGE_PROVIDER = undefined;
    envState.AI_CONTENT_MODEL = undefined;
    envState.AI_IMAGE_MODEL = undefined;
  });

  it('retries with fallback provider when primary LLM fails', async () => {
    configuredProviders.add('openai');
    configuredProviders.add('mock');
    envState.AI_FALLBACK_PROVIDER = 'mock';

    const registry = new ProviderRegistry();
    registry.registerLlm(new FailingLlmProvider());
    registry.registerLlm(new SuccessLlmProvider('mock', '{"title":"fallback"}'));
    registry.registerImage(new SuccessImageProvider('mock'));

    const gateway = new AiGatewayService(registry);
    const req: AiCompletionRequest = {
      capability: 'content',
      system: 'system',
      user: 'user',
    };

    const response = await gateway.complete(req);

    expect(response.provider).toBe('mock');
    expect(response.text).toBe('{"title":"fallback"}');
    expect(response.usage?.totalTokens).toBe(42);
    expect(response.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('works with mock-only providers when no API keys are configured', async () => {
    const registry = new ProviderRegistry();
    registry.registerLlm(new SuccessLlmProvider('mock', '{"title":"mock-only"}'));
    registry.registerImage(new SuccessImageProvider('mock'));

    const gateway = new AiGatewayService(registry);

    const completion = await gateway.complete({
      capability: 'content',
      system: 'system',
      user: 'user',
    });

    const image = await gateway.generateImage({
      prompt: 'A brand hero image',
    });

    expect(completion.provider).toBe('mock');
    expect(completion.text).toBe('{"title":"mock-only"}');
    expect(image.provider).toBe('mock');
    expect(image.imageBuffer.toString()).toBe('mock-image');
    expect(image.mimeType).toBe('image/png');
  });

  it('retries image generation with fallback when primary fails', async () => {
    configuredProviders.add('openai');
    configuredProviders.add('mock');
    envState.AI_FALLBACK_PROVIDER = 'mock';
    envState.AI_IMAGE_PROVIDER = 'openai';

    const registry = new ProviderRegistry();
    registry.registerLlm(new SuccessLlmProvider('mock'));
    registry.registerImage(new FailingImageProvider());
    registry.registerImage(new SuccessImageProvider('mock'));

    const gateway = new AiGatewayService(registry);
    const req: AiImageRequest = { prompt: 'product shot' };

    const response = await gateway.generateImage(req);

    expect(response.provider).toBe('mock');
    expect(response.imageBuffer.length).toBeGreaterThan(0);
  });
});
