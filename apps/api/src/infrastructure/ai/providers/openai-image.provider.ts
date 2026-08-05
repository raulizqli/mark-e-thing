// apps/api/src/infrastructure/ai/providers/openai-image.provider.ts

import OpenAI from 'openai';
import { env } from '../../../config/env';
import type { ImageGenerateParams, ImageGenerateResult, ImageProvider } from './image-provider.interface';

export class OpenAiImageProvider implements ImageProvider {
  readonly name = 'openai' as const;
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async generate(params: ImageGenerateParams): Promise<ImageGenerateResult> {
    const response = await this.client.images.generate({
      model: params.model,
      prompt: params.prompt,
      n: 1,
      size: '1024x1024',
    });

    const image = response.data?.[0];
    if (!image?.url) {
      throw new Error('OpenAI image generation returned no URL');
    }

    const fetched = await fetch(image.url);
    const arrayBuffer = await fetched.arrayBuffer();

    return {
      imageBuffer: Buffer.from(arrayBuffer),
      mimeType: fetched.headers.get('content-type') ?? 'image/png',
    };
  }
}
