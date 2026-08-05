// src/modules/llm/providers/gemini.provider.ts
import axios, { type AxiosInstance } from 'axios';
import type { LlmMessage, LlmProvider } from '../llm-provider.interface.js';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini' as const;

  constructor(
    private readonly apiKey: string,
    private readonly http: AxiosInstance = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 60_000,
    }),
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    const system = messages.find((message) => message.role === 'system')?.content;
    const user = messages
      .filter((message) => message.role === 'user')
      .map((message) => message.content)
      .join('\n');

    const { data } = await this.http.post<GeminiResponse>(
      `/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: [system, user].filter(Boolean).join('\n\n') }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      },
    );

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Gemini returned an empty response');
    }
    return content;
  }
}
