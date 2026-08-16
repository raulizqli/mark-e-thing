// apps/api/src/infrastructure/ai/together-image.generator.ts

import { Injectable } from '@nestjs/common';
import { env } from '../../config/env';
import type {
  GeneratedImageResult,
  GenerateImageParams,
  ImageGeneratorPort,
} from '@domain/services/image-generator.port';

interface TogetherImageResponse {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string } | string;
}

@Injectable()
export class TogetherImageGenerator implements ImageGeneratorPort {
  async generate(params: GenerateImageParams): Promise<GeneratedImageResult> {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.TOGETHER_IMAGE_MODEL,
        prompt: params.prompt,
        width: 1024,
        height: 1024,
        n: 1,
        response_format: 'url',
      }),
    });

    const payload = (await response.json()) as TogetherImageResponse;
    if (!response.ok) {
      const message =
        typeof payload.error === 'string'
          ? payload.error
          : payload.error?.message ?? `Together image error (${response.status})`;
      throw new Error(message);
    }

    const image = payload.data?.[0];
    if (image?.b64_json) {
      return {
        imageBuffer: Buffer.from(image.b64_json, 'base64'),
        mimeType: 'image/png',
        model: env.TOGETHER_IMAGE_MODEL,
      };
    }

    if (!image?.url) {
      throw new Error('Together image generation returned no URL');
    }

    const fetched = await fetch(image.url);
    const arrayBuffer = await fetched.arrayBuffer();

    return {
      imageBuffer: Buffer.from(arrayBuffer),
      mimeType: fetched.headers.get('content-type') ?? 'image/png',
      model: env.TOGETHER_IMAGE_MODEL,
    };
  }
}
