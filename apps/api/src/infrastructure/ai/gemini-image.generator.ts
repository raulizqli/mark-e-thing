// apps/api/src/infrastructure/ai/gemini-image.generator.ts

import { Injectable } from '@nestjs/common';
import { env } from '../../config/env';
import type {
  GeneratedImageResult,
  GenerateImageParams,
  ImageGeneratorPort,
} from '@domain/services/image-generator.port';

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string };
        text?: string;
      }>;
    };
  }>;
  error?: { message?: string };
}

@Injectable()
export class GeminiImageGenerator implements ImageGeneratorPort {
  async generate(params: GenerateImageParams): Promise<GeneratedImageResult> {
    const model = env.GEMINI_IMAGE_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Generate a marketing image: ${params.prompt}` }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    const payload = (await response.json()) as GeminiImageResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Gemini image error (${response.status})`);
    }

    const parts = payload.candidates?.[0]?.content?.parts ?? [];
    const inline = parts.find((part) => part.inlineData?.data)?.inlineData;
    if (!inline?.data) {
      throw new Error('Gemini image generation returned no image data');
    }

    return {
      imageBuffer: Buffer.from(inline.data, 'base64'),
      mimeType: inline.mimeType ?? 'image/png',
      model,
    };
  }
}
