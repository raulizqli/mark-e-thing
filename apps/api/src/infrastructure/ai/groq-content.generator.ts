// apps/api/src/infrastructure/ai/groq-content.generator.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
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

@Injectable()
export class GroqContentGenerator implements ContentGeneratorPort {
  private readonly client = new OpenAI({
    apiKey: env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  async generate(params: GenerateContentParams): Promise<GeneratedContentResult> {
    const completion = await this.client.chat.completions.create({
      model: env.GROQ_CONTENT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CONTENT_SYSTEM_PROMPT },
        { role: 'user', content: buildContentUserPrompt(params) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Groq returned empty content');
    }

    return JSON.parse(raw) as GeneratedContentResult;
  }
}
