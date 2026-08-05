// apps/api/src/infrastructure/ai/gateway-image.generator.ts

import type {
  GeneratedImageResult,
  GenerateImageParams,
  ImageGeneratorPort,
} from '@domain/services/image-generator.port';
import type { AiGatewayPort } from '@domain/services/ai-gateway.port';

export class GatewayImageGenerator implements ImageGeneratorPort {
  constructor(private readonly gateway: AiGatewayPort) {}

  async generate(params: GenerateImageParams): Promise<GeneratedImageResult> {
    const response = await this.gateway.generateImage({
      prompt: params.prompt,
    });

    return {
      imageBuffer: response.imageBuffer,
      mimeType: response.mimeType,
      model: response.model,
    };
  }
}
