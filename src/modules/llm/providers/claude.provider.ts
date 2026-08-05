// src/modules/llm/providers/claude.provider.ts
import axios, { type AxiosInstance } from 'axios';
import type { LlmMessage, LlmProvider } from '../llm-provider.interface.js';

interface ClaudeResponse {
  content?: Array<{ type?: string; text?: string }>;
}

export class ClaudeProvider implements LlmProvider {
  readonly name = 'claude' as const;

  constructor(
    private readonly apiKey: string,
    private readonly http: AxiosInstance = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      timeout: 60_000,
    }),
  ) {}

  async complete(messages: LlmMessage[]): Promise<string> {
    const system = messages.find((message) => message.role === 'system')?.content;
    const userMessages = messages
      .filter((message) => message.role === 'user')
      .map((message) => ({
        role: 'user' as const,
        content: message.content,
      }));

    const { data } = await this.http.post<ClaudeResponse>(
      '/messages',
      {
        model: 'claude-3-5-haiku-latest',
        max_tokens: 2048,
        temperature: 0.2,
        system,
        messages: userMessages,
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      },
    );

    const content = data.content?.find((part) => part.type === 'text')?.text;
    if (!content) {
      throw new Error('Claude returned an empty response');
    }
    return content;
  }
}
