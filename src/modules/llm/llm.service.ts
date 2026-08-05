// src/modules/llm/llm.service.ts
import type { Business, DigitalPresence } from '@prisma/client';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/app-error.js';
import type { ScoringResult } from '../scoring/scoring.engine.js';
import { createLlmProvider } from './llm.factory.js';
import type { LlmProvider } from './llm-provider.interface.js';

export const llmGenerationSchema = z.object({
  summary: z.string().min(1),
  opportunities: z.array(z.string()).min(1),
  salesProposal: z.string().min(1),
  coldEmail: z.string().min(1),
  whatsappMessage: z.string().min(1),
  aiNeeds: z.record(z.unknown()).default({}),
});

export type LlmGenerationResult = z.infer<typeof llmGenerationSchema>;

export class LlmService {
  constructor(private readonly provider: LlmProvider = createLlmProvider()) {}

  async generateAnalysis(input: {
    business: Business;
    digitalPresence: DigitalPresence | null;
    scoring: ScoringResult;
  }): Promise<LlmGenerationResult> {
    const prompt = buildPrompt(input);
    const raw = await this.provider.complete([
      {
        role: 'system',
        content:
          'You are a B2B sales strategist. Respond with valid JSON only matching the requested schema.',
      },
      { role: 'user', content: prompt },
    ]);

    return parseGeneration(raw);
  }
}

export function parseGeneration(raw: string): LlmGenerationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('LLM returned non-JSON content', { raw });
  }

  const result = llmGenerationSchema.safeParse(parsed);
  if (!result.success) {
    throw new ValidationError('LLM response failed schema validation', {
      issues: result.error.flatten(),
    });
  }

  return result.data;
}

function buildPrompt(input: {
  business: Business;
  digitalPresence: DigitalPresence | null;
  scoring: ScoringResult;
}): string {
  return [
    'Generate outreach assets for this local business prospect.',
    'Return JSON with keys: summary, opportunities (string[]), salesProposal, coldEmail, whatsappMessage, aiNeeds (object).',
    `Business: ${JSON.stringify({
      name: input.business.name,
      address: input.business.formattedAddress,
      website: input.business.websiteUri,
      rating: input.business.rating,
      reviews: input.business.userRatingCount,
      type: input.business.primaryType,
    })}`,
    `Digital presence: ${JSON.stringify(input.digitalPresence)}`,
    `Lead score: ${input.scoring.leadScore} (${input.scoring.priority})`,
    `Scoring rules: ${JSON.stringify(input.scoring.scoringRules)}`,
  ].join('\n');
}
