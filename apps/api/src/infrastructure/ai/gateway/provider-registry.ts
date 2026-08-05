// apps/api/src/infrastructure/ai/gateway/provider-registry.ts

import type { AiProviderName } from '@domain/services/ai-gateway.port';
import type { ImageProvider } from '../providers/image-provider.interface';
import type { LlmProvider } from '../providers/llm-provider.interface';

export class ProviderRegistry {
  private readonly llmProviders = new Map<AiProviderName, LlmProvider>();
  private readonly imageProviders = new Map<AiProviderName, ImageProvider>();

  registerLlm(provider: LlmProvider): void {
    this.llmProviders.set(provider.name, provider);
  }

  registerImage(provider: ImageProvider): void {
    this.imageProviders.set(provider.name, provider);
  }

  getLlm(name: AiProviderName): LlmProvider | undefined {
    return this.llmProviders.get(name);
  }

  getImage(name: AiProviderName): ImageProvider | undefined {
    return this.imageProviders.get(name);
  }

  listLlmProviders(): AiProviderName[] {
    return [...this.llmProviders.keys()];
  }

  listImageProviders(): AiProviderName[] {
    return [...this.imageProviders.keys()];
  }
}
