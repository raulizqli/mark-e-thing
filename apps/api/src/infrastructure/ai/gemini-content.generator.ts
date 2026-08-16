// apps/api/src/infrastructure/ai/gemini-content.generator.ts

import { Injectable } from '@nestjs/common';
import { env } from '../../config/env';
import type {
  ContentGeneratorPort,
  GeneratedContentResult,
  GenerateContentParams,
} from '@domain/services/content-generator.port';
import {
  buildContentUserPrompt,
  CONTENT_SYSTEM_PROMPT,
} from './content-prompt.builder';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

@Injectable()
export class GeminiContentGenerator implements ContentGeneratorPort {
  async generate(params: GenerateContentParams): Promise<GeneratedContentResult> {
    const model = env.GEMINI_CONTENT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: CONTENT_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildContentUserPrompt(params) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    const payload = (await response.json()) as GeminiGenerateResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Gemini content error (${response.status})`);
    }

    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      throw new Error('Gemini returned empty content');
    }

    return JSON.parse(raw) as GeneratedContentResult;
  }
}
