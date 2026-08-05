// apps/api/src/domain/services/ai-gateway.port.ts

export type AiProviderName = 'openai' | 'anthropic' | 'gemini' | 'mock';
export type AiCapability = 'content' | 'image' | 'seo' | 'reasoning';

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AiCompletionRequest {
  capability: Exclude<AiCapability, 'image'>;
  system: string;
  user: string;
  jsonSchemaHint?: string;
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
}

export interface AiCompletionResponse {
  text: string;
  provider: AiProviderName;
  model: string;
  latencyMs: number;
  usage?: AiUsage;
}

export interface AiImageRequest {
  prompt: string;
  provider?: AiProviderName;
  model?: string;
}

export interface AiImageResponse {
  imageBuffer: Buffer;
  mimeType: string;
  provider: AiProviderName;
  model: string;
  latencyMs: number;
}

export interface AiGatewayPort {
  complete(req: AiCompletionRequest): Promise<AiCompletionResponse>;
  generateImage(req: AiImageRequest): Promise<AiImageResponse>;
}
