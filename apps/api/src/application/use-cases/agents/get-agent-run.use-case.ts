// apps/api/src/application/use-cases/agents/get-agent-run.use-case.ts

import type { AgentRun } from '@domain/entities/agent.entity';
import type { AgentRunRepository } from '@domain/repositories/agent-run.repository';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { RecommendationRepository } from '@domain/repositories/recommendation.repository';
import { AppError } from '@shared/errors/app-error';

export class GetAgentRunUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly agentRunRepository: AgentRunRepository,
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async execute(userId: string, companyId: string, runId: string): Promise<AgentRun> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const run = await this.agentRunRepository.findByIdForCompany(runId, companyId);
    if (!run) {
      throw AppError.notFound('AgentRun', runId);
    }

    const [steps, allRecommendations] = await Promise.all([
      this.agentRunRepository.findStepsByRunId(runId),
      this.recommendationRepository.findAllByCompanyId(companyId),
    ]);

    return {
      ...run,
      steps,
      recommendations: allRecommendations.filter((r) => r.runId === runId),
    };
  }
}
