// apps/api/src/domain/agents/agent.port.ts

import type { Company } from '../entities/company.entity';
import type { Content } from '../entities/content.entity';
import type { MetricsSnapshot } from '../entities/agent.entity';
import type { AgentType } from '../types/agent-enums';

export interface AgentContext {
  company: Company;
  knowledgeTexts: string[];
  recentContents: Content[];
  metrics: MetricsSnapshot | null;
  previousSteps: Record<string, unknown>;
  goal?: string;
}

export interface AgentRecommendation {
  type: string;
  title: string;
  description: string;
  priority?: number;
  payload?: Record<string, unknown>;
}

export interface AgentResult {
  agent: AgentType;
  insights: string[];
  decisions: string[];
  data: Record<string, unknown>;
  recommendations: AgentRecommendation[];
}

export interface MarketingAgent {
  readonly type: AgentType;
  run(ctx: AgentContext): Promise<AgentResult>;
}

export interface OrchestratorInput {
  companyId: string;
  company: Company;
  knowledgeTexts: string[];
  recentContents: Content[];
  metrics: MetricsSnapshot;
  goal?: string;
}

export interface OrchestratorStepResult {
  agent: AgentType;
  status: 'COMPLETED' | 'FAILED';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  provider: string | null;
  model: string | null;
  latencyMs: number;
  error: string | null;
  result: AgentResult | null;
}

export interface OrchestratorOutput {
  summary: string;
  plan: Record<string, unknown>;
  steps: OrchestratorStepResult[];
  recommendations: AgentRecommendation[];
}

export interface MarketingOrchestratorPort {
  run(input: OrchestratorInput): Promise<OrchestratorOutput>;
}
