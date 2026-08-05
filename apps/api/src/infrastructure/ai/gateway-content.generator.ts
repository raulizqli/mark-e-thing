// apps/api/src/infrastructure/ai/gateway-content.generator.ts

import type {
  ContentGeneratorPort,
  GeneratedContentResult,
  GenerateContentParams,
} from '@domain/services/content-generator.port';
import type { AiGatewayPort } from '@domain/services/ai-gateway.port';
import {
  buildContentUserPrompt,
  contentResponseSchemaHint,
  contentSystemPrompt,
} from './content-prompt';

export class GatewayContentGenerator implements ContentGeneratorPort {
  constructor(private readonly gateway: AiGatewayPort) {}

  async generate(params: GenerateContentParams): Promise<GeneratedContentResult> {
    const response = await this.gateway.complete({
      capability: 'content',
      system: contentSystemPrompt,
      user: buildContentUserPrompt(params),
      jsonSchemaHint: contentResponseSchemaHint,
    });

    return JSON.parse(response.text) as GeneratedContentResult;
  }
}
