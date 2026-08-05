// apps/api/src/infrastructure/ai/content-prompt.ts

import type { GenerateContentParams } from '@domain/services/content-generator.port';

export const contentResponseSchemaHint = JSON.stringify({
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
});

export const contentSystemPrompt =
  'You are a marketing copywriter. Produce on-brand, platform-appropriate content as strict JSON.';

export function buildContentUserPrompt(params: GenerateContentParams): string {
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

  return [
    `Generate marketing content for content type: ${params.contentType}.`,
    brandContext,
    knowledgeBlock,
    params.topic ? `Additional instructions: ${params.topic}` : '',
    'Return JSON with title, copy, cta, emojis, hashtags, imagePrompt, seoKeywords.',
    'Avoid forbidden words. Use preferred CTAs when appropriate.',
  ]
    .filter(Boolean)
    .join('\n\n');
}
