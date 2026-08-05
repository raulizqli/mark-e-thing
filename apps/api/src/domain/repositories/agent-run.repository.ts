// apps/api/src/domain/repositories/agent-run.repository.ts

import type {
  AgentRun,
  AgentStep,
  CreateAgentRunData,
  CreateAgentStepData,
  UpdateAgentRunData,
} from '../entities/agent.entity';

export interface AgentRunRepository {
  create(data: CreateAgentRunData): Promise<AgentRun>;
  update(id: string, data: UpdateAgentRunData): Promise<AgentRun>;
  findById(id: string): Promise<AgentRun | null>;
  findByIdForCompany(id: string, companyId: string): Promise<AgentRun | null>;
  findAllByCompanyId(companyId: string): Promise<AgentRun[]>;
  createStep(data: CreateAgentStepData): Promise<AgentStep>;
  findStepsByRunId(runId: string): Promise<AgentStep[]>;
}
