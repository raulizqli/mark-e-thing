// apps/api/src/application/dto/agent.dto.ts

import type {
  RecommendationStatus,
  RecommendationType,
} from '@domain/types/agent-enums';

export interface RunMarketingAgentInput {
  companyId: string;
  goal?: string;
}

export interface UpdateRecommendationStatusInput {
  status: RecommendationStatus;
}

export interface UpsertAiSettingsInput {
  contentProvider?: string | null;
  contentModel?: string | null;
  imageProvider?: string | null;
  imageModel?: string | null;
  reasoningProvider?: string | null;
  reasoningModel?: string | null;
}

export interface ListRecommendationsQuery {
  status?: RecommendationStatus;
}

export type { RecommendationType, RecommendationStatus };
