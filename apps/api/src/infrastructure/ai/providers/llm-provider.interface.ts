// apps/api/src/infrastructure/ai/providers/llm-provider.interface.ts

import type { AiProviderName, AiUsage } from '@domain/services/ai-gateway.port';

export interface LlmCompleteParams {
  system: string;
  user: string;
  model: string;
  temperature?: number;
  jsonSchemaHint?: string;
}

export interface LlmCompleteResult {
  text: string;
  usage?: AiUsage;
}

export interface LlmProvider {
  readonly name: AiProviderName;
  complete(params: LlmCompleteParams): Promise<LlmCompleteResult>;
}
