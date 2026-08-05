// src/modules/llm/llm-provider.interface.ts
export interface LlmMessage {
  role: 'system' | 'user';
  content: string;
}

export interface LlmProvider {
  readonly name: 'openai' | 'gemini' | 'claude';
  complete(messages: LlmMessage[]): Promise<string>;
}
