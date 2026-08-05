// apps/api/src/infrastructure/ai/gateway/ai-gateway.service.ts

import { env, isProviderConfigured } from '../../../config/env';
import type {
  AiCapability,
  AiCompletionRequest,
  AiCompletionResponse,
  AiGatewayPort,
  AiImageRequest,
  AiImageResponse,
  AiProviderName,
} from '@domain/services/ai-gateway.port';
import { GeminiImageProvider } from '../providers/gemini-image.provider';
import type { ImageProvider } from '../providers/image-provider.interface';
import type { LlmProvider } from '../providers/llm-provider.interface';
import { ProviderRegistry } from './provider-registry';

const DEFAULT_MODELS: Record<AiProviderName, { content: string; image: string; reasoning: string }> = {
  openai: {
    content: env.OPENAI_CONTENT_MODEL,
    image: env.OPENAI_IMAGE_MODEL,
    reasoning: env.OPENAI_CONTENT_MODEL,
  },
  anthropic: {
    content: 'claude-3-5-sonnet-20241022',
    image: env.OPENAI_IMAGE_MODEL,
    reasoning: 'claude-3-5-sonnet-20241022',
  },
  gemini: {
    content: 'gemini-1.5-flash',
    image: 'gemini-1.5-flash',
    reasoning: 'gemini-1.5-flash',
  },
  mock: {
    content: 'mock-content',
    image: `${env.OPENAI_IMAGE_MODEL}-mock`,
    reasoning: 'mock-reasoning',
  },
};

export class AiGatewayService implements AiGatewayPort {
  constructor(private readonly registry: ProviderRegistry) {}

  async complete(req: AiCompletionRequest): Promise<AiCompletionResponse> {
    const primary = this.resolveLlmProvider(req.capability, req.provider);
    const model = this.resolveModel(req.capability, primary.name, req.model);

    try {
      return await this.executeComplete(primary, model, req);
    } catch (primaryError) {
      const fallback = this.resolveFallbackLlmProvider(req.capability, primary.name);
      if (!fallback) {
        throw primaryError;
      }

      const fallbackModel = this.resolveModel(req.capability, fallback.name, req.model);
      return this.executeComplete(fallback, fallbackModel, req);
    }
  }

  async generateImage(req: AiImageRequest): Promise<AiImageResponse> {
    const primary = this.resolveImageProvider(req.provider);
    const model = this.resolveImageModel(primary.name, req.model);

    try {
      return await this.executeGenerateImage(primary, model, req);
    } catch (primaryError) {
      const fallback = this.resolveFallbackImageProvider(primary.name);
      if (!fallback) {
        throw primaryError;
      }

      const fallbackModel = this.resolveImageModel(fallback.name, req.model);
      return this.executeGenerateImage(fallback, fallbackModel, req);
    }
  }

  private async executeComplete(
    provider: LlmProvider,
    model: string,
    req: AiCompletionRequest,
  ): Promise<AiCompletionResponse> {
    const started = Date.now();
    const result = await provider.complete({
      system: req.system,
      user: req.user,
      model,
      temperature: req.temperature,
      jsonSchemaHint: req.jsonSchemaHint,
    });

    return {
      text: result.text,
      provider: provider.name,
      model,
      latencyMs: Date.now() - started,
      usage: result.usage,
    };
  }

  private async executeGenerateImage(
    provider: ImageProvider,
    model: string,
    req: AiImageRequest,
  ): Promise<AiImageResponse> {
    const started = Date.now();
    const result = await provider.generate({ prompt: req.prompt, model });
    const resolvedModel =
      provider instanceof GeminiImageProvider ? provider.stubModelLabel(model) : model;

    return {
      imageBuffer: result.imageBuffer,
      mimeType: result.mimeType,
      provider: provider.name,
      model: resolvedModel,
      latencyMs: Date.now() - started,
    };
  }

  private resolveLlmProvider(
    capability: Exclude<AiCapability, 'image'>,
    override?: AiProviderName,
  ): LlmProvider {
    const candidates = this.buildLlmCandidateOrder(capability, override);

    for (const name of candidates) {
      if (!isProviderConfigured(name)) {
        continue;
      }
      const provider = this.registry.getLlm(name);
      if (provider) {
        return provider;
      }
    }

    const mock = this.registry.getLlm('mock');
    if (!mock) {
      throw new Error('No LLM providers registered');
    }
    return mock;
  }

  private resolveImageProvider(override?: AiProviderName): ImageProvider {
    const candidates = this.buildImageCandidateOrder(override);

    for (const name of candidates) {
      if (!isProviderConfigured(name)) {
        continue;
      }
      const provider = this.registry.getImage(name);
      if (provider) {
        return provider;
      }
    }

    const mock = this.registry.getImage('mock');
    if (!mock) {
      throw new Error('No image providers registered');
    }
    return mock;
  }

  private resolveFallbackLlmProvider(
    _capability: Exclude<AiCapability, 'image'>,
    primary: AiProviderName,
  ): LlmProvider | undefined {
    const fallbackName = env.AI_FALLBACK_PROVIDER;
    if (!fallbackName || fallbackName === primary || !isProviderConfigured(fallbackName)) {
      return undefined;
    }
    return this.registry.getLlm(fallbackName);
  }

  private resolveFallbackImageProvider(primary: AiProviderName): ImageProvider | undefined {
    const fallbackName = env.AI_FALLBACK_PROVIDER;
    if (!fallbackName || fallbackName === primary || !isProviderConfigured(fallbackName)) {
      return undefined;
    }
    return this.registry.getImage(fallbackName);
  }

  private buildLlmCandidateOrder(
    capability: Exclude<AiCapability, 'image'>,
    override?: AiProviderName,
  ): AiProviderName[] {
    const envDefault = this.envProviderForCapability(capability);
    const ordered = [override, envDefault, 'openai', 'mock'].filter(
      (name): name is AiProviderName => Boolean(name),
    );

    return [...new Set(ordered)];
  }

  private buildImageCandidateOrder(override?: AiProviderName): AiProviderName[] {
    const envDefault = env.AI_IMAGE_PROVIDER ?? env.AI_CONTENT_PROVIDER;
    const ordered = [override, envDefault, 'openai', 'mock'].filter(
      (name): name is AiProviderName => Boolean(name),
    );

    return [...new Set(ordered)];
  }

  private envProviderForCapability(capability: Exclude<AiCapability, 'image'>): AiProviderName | undefined {
    switch (capability) {
      case 'content':
      case 'seo':
        return env.AI_CONTENT_PROVIDER;
      case 'reasoning':
        return env.AI_REASONING_PROVIDER ?? env.AI_CONTENT_PROVIDER;
      default:
        return env.AI_CONTENT_PROVIDER;
    }
  }

  private resolveModel(
    capability: Exclude<AiCapability, 'image'>,
    provider: AiProviderName,
    override?: string,
  ): string {
    if (override) {
      return override;
    }

    const envModel = this.envModelForCapability(capability);
    if (envModel) {
      return envModel;
    }

    if (capability === 'content' || capability === 'seo') {
      if (provider === 'openai') {
        return env.OPENAI_CONTENT_MODEL;
      }
    }

    return DEFAULT_MODELS[provider][capability === 'reasoning' ? 'reasoning' : 'content'];
  }

  private resolveImageModel(provider: AiProviderName, override?: string): string {
    if (override) {
      return override;
    }

    if (env.AI_IMAGE_MODEL) {
      return env.AI_IMAGE_MODEL;
    }

    if (provider === 'openai') {
      return env.OPENAI_IMAGE_MODEL;
    }

    return DEFAULT_MODELS[provider].image;
  }

  private envModelForCapability(capability: Exclude<AiCapability, 'image'>): string | undefined {
    switch (capability) {
      case 'content':
      case 'seo':
        return env.AI_CONTENT_MODEL;
      case 'reasoning':
        return env.AI_REASONING_MODEL ?? env.AI_CONTENT_MODEL;
      default:
        return env.AI_CONTENT_MODEL;
    }
  }
}
