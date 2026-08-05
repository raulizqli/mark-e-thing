// apps/api/src/application/use-cases/agents/list-agent-runs.use-case.ts

import type { AgentRun } from '@domain/entities/agent.entity';
import type { AgentRunRepository } from '@domain/repositories/agent-run.repository';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import { AppError } from '@shared/errors/app-error';

export class ListAgentRunsUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly agentRunRepository: AgentRunRepository,
  ) {}

  async execute(userId: string, companyId: string): Promise<AgentRun[]> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    return this.agentRunRepository.findAllByCompanyId(companyId);
  }
}
