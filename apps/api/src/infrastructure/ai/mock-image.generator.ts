// apps/api/src/infrastructure/ai/mock-image.generator.ts

import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { env } from '../../config/env';
import type {
  GeneratedImageResult,
  GenerateImageParams,
  ImageGeneratorPort,
} from '@domain/services/image-generator.port';

@Injectable()
export class MockImageGenerator implements ImageGeneratorPort {
  async generate(params: GenerateImageParams): Promise<GeneratedImageResult> {
    const hash = createHash('sha256').update(params.prompt).digest('hex').slice(0, 6);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#${hash.slice(0, 6)}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20">Mock Image</text>
</svg>`;
    const imageBuffer = Buffer.from(svg, 'utf8');

    return {
      imageBuffer,
      mimeType: 'image/svg+xml',
      model: `${env.OPENAI_IMAGE_MODEL}-mock`,
    };
  }
}
