// src/modules/llm/providers/openai.provider.ts
import axios, { type AxiosInstance } from 'axios';
import type { LlmMessage, LlmProvider } from '../llm-provider.interface.js';

interface OpenAiChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai' as const;

  constructor(
    private readonly apiKey: string,
    private readonly http: AxiosInstance = axios.create({
      baseURL: 'https://api.openai.com/v1',
      timeout: 60_000,
    }),
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    const { data } = await this.http.post<OpenAiChatResponse>(
      '/chat/completions',
      {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }
    return content;
  }
}
