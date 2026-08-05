// apps/api/src/infrastructure/ai/providers/image-provider.interface.ts

import type { AiProviderName } from '@domain/services/ai-gateway.port';

export interface ImageGenerateParams {
  prompt: string;
  model: string;
}

export interface ImageGenerateResult {
  imageBuffer: Buffer;
  mimeType: string;
}

export interface ImageProvider {
  readonly name: AiProviderName;
  generate(params: ImageGenerateParams): Promise<ImageGenerateResult>;
}
