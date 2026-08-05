// apps/api/src/infrastructure/ai/providers/openai-llm.provider.ts

import OpenAI from 'openai';
import { env } from '../../../config/env';
import type { LlmCompleteParams, LlmCompleteResult, LlmProvider } from './llm-provider.interface';

export class OpenAiLlmProvider implements LlmProvider {
  readonly name = 'openai' as const;
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async complete(params: LlmCompleteParams): Promise<LlmCompleteResult> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ];

    const completion = await this.client.chat.completions.create({
      model: params.model,
      temperature: params.temperature,
      messages,
      ...(params.jsonSchemaHint
        ? { response_format: { type: 'json_object' as const } }
        : {}),
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error('OpenAI returned empty content');
    }

    return {
      text,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }
}
