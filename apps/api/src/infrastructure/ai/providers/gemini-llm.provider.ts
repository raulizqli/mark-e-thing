// apps/api/src/infrastructure/ai/providers/gemini-llm.provider.ts

import { env } from '../../../config/env';
import type { LlmCompleteParams, LlmCompleteResult, LlmProvider } from './llm-provider.interface';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export class GeminiLlmProvider implements LlmProvider {
  readonly name = 'gemini' as const;

  async complete(params: LlmCompleteParams): Promise<LlmCompleteResult> {
    const userContent = params.jsonSchemaHint
      ? `${params.user}\n\nRespond with valid JSON only matching this schema:\n${params.jsonSchemaHint}`
      : params.user;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${encodeURIComponent(env.GOOGLE_AI_API_KEY!)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.system }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: {
          temperature: params.temperature ?? 0.7,
          ...(params.jsonSchemaHint ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned empty content');
    }

    const usage = data.usageMetadata;

    return {
      text,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount,
            completionTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount,
          }
        : undefined,
    };
  }
}
