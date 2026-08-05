// apps/api/src/infrastructure/ai/providers/gemini-image.provider.ts

import type { ImageGenerateParams, ImageGenerateResult, ImageProvider } from './image-provider.interface';
import { MockImageProvider } from './mock-image.provider';

/**
 * Gemini image generation is not yet wired to the Google Imagen API.
 * Falls back to mock output with a model suffix indicating the stub.
 */
export class GeminiImageProvider implements ImageProvider {
  readonly name = 'gemini' as const;
  private readonly mock = new MockImageProvider();

  async generate(params: ImageGenerateParams): Promise<ImageGenerateResult> {
    const result = await this.mock.generate(params);
    return result;
  }

  stubModelLabel(model: string): string {
    return `${model}-gemini-stub`;
  }
}
