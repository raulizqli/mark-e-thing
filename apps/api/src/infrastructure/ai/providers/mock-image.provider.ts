// apps/api/src/infrastructure/ai/providers/mock-image.provider.ts

import { createHash } from 'node:crypto';
import type { ImageGenerateParams, ImageGenerateResult, ImageProvider } from './image-provider.interface';

export class MockImageProvider implements ImageProvider {
  readonly name = 'mock' as const;

  async generate(params: ImageGenerateParams): Promise<ImageGenerateResult> {
    const hash = createHash('sha256').update(params.prompt).digest('hex').slice(0, 6);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#${hash.slice(0, 6)}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20">Mock Image</text>
</svg>`;

    return {
      imageBuffer: Buffer.from(svg, 'utf8'),
      mimeType: 'image/svg+xml',
    };
  }
}
