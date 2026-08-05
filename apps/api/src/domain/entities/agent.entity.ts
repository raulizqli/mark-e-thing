// apps/api/src/domain/entities/agent.entity.ts

import type {
  AgentRunStatus,
  AgentType,
  RecommendationStatus,
  RecommendationType,
} from '../types/agent-enums';

export interface CompanyAiSettings {
  id: string;
  companyId: string;
  contentProvider: string | null;
  contentModel: string | null;
  imageProvider: string | null;
  imageModel: string | null;
  reasoningProvider: string | null;
  reasoningModel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UpsertCompanyAiSettingsData = Partial<
  Omit<CompanyAiSettings, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
>;

export interface MetricsSnapshot {
  id: string;
  companyId: string;
  platform: string | null;
  periodStart: Date;
  periodEnd: Date;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  conversions: number;
  bestHours: number[] | null;
  raw: Record<string, unknown> | null;
  source: string;
  createdAt: Date;
}

export type CreateMetricsSnapshotData = Pick<
  MetricsSnapshot,
  'companyId' | 'periodStart' | 'periodEnd'
> &
  Partial<
    Omit<MetricsSnapshot, 'id' | 'companyId' | 'periodStart' | 'periodEnd' | 'createdAt'>
  >;

export interface AgentStep {
  id: string;
  runId: string;
  agent: AgentType;
  status: AgentRunStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  provider: string | null;
  model: string | null;
  latencyMs: number | null;
  error: string | null;
  createdAt: Date;
}

export type CreateAgentStepData = Pick<
  AgentStep,
  'runId' | 'agent' | 'status'
> &
  Partial<
    Omit<AgentStep, 'id' | 'runId' | 'agent' | 'status' | 'createdAt'>
  >;

export interface AgentRun {
  id: string;
  companyId: string;
  status: AgentRunStatus;
  goal: string | null;
  summary: string | null;
  plan: Record<string, unknown> | null;
  error: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  steps?: AgentStep[];
  recommendations?: Recommendation[];
}

export type CreateAgentRunData = Pick<AgentRun, 'companyId' | 'status'> &
  Partial<
    Omit<AgentRun, 'id' | 'companyId' | 'status' | 'createdAt' | 'steps' | 'recommendations'>
  >;

export type UpdateAgentRunData = Partial<
  Omit<AgentRun, 'id' | 'companyId' | 'createdAt' | 'steps' | 'recommendations'>
>;

export interface Recommendation {
  id: string;
  companyId: string;
  runId: string | null;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  payload: Record<string, unknown> | null;
  status: RecommendationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRecommendationData = Pick<
  Recommendation,
  'companyId' | 'type' | 'title' | 'description'
> &
  Partial<
    Omit<Recommendation, 'id' | 'companyId' | 'type' | 'title' | 'description' | 'createdAt' | 'updatedAt'>
  >;

export type UpdateRecommendationData = Partial<
  Pick<Recommendation, 'status' | 'payload'>
>;
