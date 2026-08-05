// apps/api/src/infrastructure/ai/providers/anthropic-llm.provider.ts

import { env } from '../../../config/env';
import type { LlmCompleteParams, LlmCompleteResult, LlmProvider } from './llm-provider.interface';

interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export class AnthropicLlmProvider implements LlmProvider {
  readonly name = 'anthropic' as const;

  async complete(params: LlmCompleteParams): Promise<LlmCompleteResult> {
    const userContent = params.jsonSchemaHint
      ? `${params.user}\n\nRespond with valid JSON only matching this schema:\n${params.jsonSchemaHint}`
      : params.user;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: 4096,
        temperature: params.temperature ?? 0.7,
        system: params.system,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const text = data.content.find((block) => block.type === 'text')?.text;
    if (!text) {
      throw new Error('Anthropic returned empty content');
    }

    const inputTokens = data.usage?.input_tokens;
    const outputTokens = data.usage?.output_tokens;

    return {
      text,
      usage:
        inputTokens !== undefined || outputTokens !== undefined
          ? {
              promptTokens: inputTokens,
              completionTokens: outputTokens,
              totalTokens:
                inputTokens !== undefined && outputTokens !== undefined
                  ? inputTokens + outputTokens
                  : undefined,
            }
          : undefined,
    };
  }
}
