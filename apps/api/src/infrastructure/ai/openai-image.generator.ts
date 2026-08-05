// apps/api/src/infrastructure/ai/openai-image.generator.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '../../config/env';
import type {
  GeneratedImageResult,
  GenerateImageParams,
  ImageGeneratorPort,
} from '@domain/services/image-generator.port';

@Injectable()
export class OpenAiImageGenerator implements ImageGeneratorPort {
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async generate(params: GenerateImageParams): Promise<GeneratedImageResult> {
    const response = await this.client.images.generate({
      model: env.OPENAI_IMAGE_MODEL,
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
      model: env.OPENAI_IMAGE_MODEL,
    };
  }
}
