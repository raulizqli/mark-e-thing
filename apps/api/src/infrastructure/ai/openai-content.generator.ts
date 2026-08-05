// apps/api/src/infrastructure/ai/openai-content.generator.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '../../config/env';
import type {
  ContentGeneratorPort,
  GeneratedContentResult,
  GenerateContentParams,
} from '@domain/services/content-generator.port';

const responseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    copy: { type: 'string' },
    cta: { type: ['string', 'null'] },
    emojis: { type: 'array', items: { type: 'string' } },
    hashtags: { type: 'array', items: { type: 'string' } },
    imagePrompt: { type: 'string' },
    seoKeywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'copy', 'cta', 'emojis', 'hashtags', 'imagePrompt', 'seoKeywords'],
  additionalProperties: false,
} as const;

@Injectable()
export class OpenAiContentGenerator implements ContentGeneratorPort {
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async generate(params: GenerateContentParams): Promise<GeneratedContentResult> {
    const brandContext = [
      `Company: ${params.company.name}`,
      `Industry: ${params.company.industry ?? 'N/A'}`,
      `Tone of voice: ${params.company.toneOfVoice ?? 'professional'}`,
      `Target audience: ${params.company.targetAudience ?? 'general'}`,
      `Forbidden words: ${params.company.forbiddenWords.join(', ') || 'none'}`,
      `Preferred CTAs: ${params.company.preferredCtas.join(', ') || 'none'}`,
      `Services: ${params.company.services.join(', ') || 'N/A'}`,
      `Products: ${params.company.products.join(', ') || 'N/A'}`,
    ].join('\n');

    const knowledgeBlock =
      params.knowledgeTexts.length > 0
        ? `Knowledge excerpts:\n${params.knowledgeTexts.map((k, i) => `${i + 1}. ${k.slice(0, 500)}`).join('\n')}`
        : 'No knowledge documents provided.';

    const userPrompt = [
      `Generate marketing content for content type: ${params.contentType}.`,
      brandContext,
      knowledgeBlock,
      params.topic ? `Additional instructions: ${params.topic}` : '',
      'Return JSON with title, copy, cta, emojis, hashtags, imagePrompt, seoKeywords.',
      'Avoid forbidden words. Use preferred CTAs when appropriate.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const completion = await this.client.chat.completions.create({
      model: env.OPENAI_CONTENT_MODEL,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'generated_content',
          schema: responseSchema,
          strict: true,
        },
      },
      messages: [
        {
          role: 'system',
          content:
            'You are a marketing copywriter. Produce on-brand, platform-appropriate content as strict JSON.',
        },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('OpenAI returned empty content');
    }

    return JSON.parse(raw) as GeneratedContentResult;
  }
}
