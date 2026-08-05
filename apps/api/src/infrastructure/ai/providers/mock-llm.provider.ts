// apps/api/src/infrastructure/ai/providers/mock-llm.provider.ts

import { createHash } from 'node:crypto';
import type { LlmCompleteParams, LlmCompleteResult, LlmProvider } from './llm-provider.interface';

export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock' as const;

  async complete(params: LlmCompleteParams): Promise<LlmCompleteResult> {
    const seed = createHash('sha256').update(`${params.system}:${params.user}`).digest('hex').slice(0, 8);

    if (params.jsonSchemaHint) {
      const companyMatch = params.user.match(/Company: (.+)/);
      const typeMatch = params.user.match(/content type: ([A-Z_]+)/);
      const company = companyMatch?.[1] ?? 'Company';
      const contentType = typeMatch?.[1] ?? 'POST';

      const payload = {
        title: `[Mock] ${contentType} for ${company}`,
        copy: `This is deterministic mock content (${seed}) generated via the AI gateway.`,
        cta: 'Learn more',
        emojis: ['✨', '🚀'],
        hashtags: ['#MarkeThing', '#MockContent', `#${contentType}`],
        imagePrompt: `Brand image for ${company}`,
        seoKeywords: [company, contentType.toLowerCase(), 'marketing'],
      };

      return { text: JSON.stringify(payload) };
    }

    return {
      text: `[Mock LLM ${seed}] ${params.user.slice(0, 120)}`,
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}
