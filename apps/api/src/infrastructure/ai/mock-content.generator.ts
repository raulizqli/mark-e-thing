// apps/api/src/infrastructure/ai/mock-content.generator.ts

import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  ContentGeneratorPort,
  GeneratedContentResult,
  GenerateContentParams,
} from '@domain/services/content-generator.port.js';

@Injectable()
export class MockContentGenerator implements ContentGeneratorPort {
  async generate(params: GenerateContentParams): Promise<GeneratedContentResult> {
    const seed = createHash('sha256')
      .update(`${params.company.id}:${params.contentType}:${params.topic ?? ''}`)
      .digest('hex')
      .slice(0, 8);

    const cta = params.company.preferredCtas[0] ?? 'Learn more';
    const audience = params.company.targetAudience ?? 'your audience';

    return {
      title: `[Mock] ${params.contentType} for ${params.company.name}`,
      copy: `This is deterministic mock content (${seed}) for ${params.company.name}. Tone: ${params.company.toneOfVoice ?? 'professional'}. Audience: ${audience}.`,
      cta,
      emojis: ['✨', '🚀'],
      hashtags: ['#MarkeThing', '#MockContent', `#${params.contentType}`],
      imagePrompt: `Brand image for ${params.company.name}, ${params.company.primaryColor ?? 'blue'} palette`,
      seoKeywords: [params.company.name, params.contentType.toLowerCase(), 'marketing'],
    };
  }
}
