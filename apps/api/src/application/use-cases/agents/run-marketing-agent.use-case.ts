// apps/api/src/application/use-cases/agents/run-marketing-agent.use-case.ts

import type { AgentRun } from '@domain/entities/agent.entity';
import type { MarketingOrchestratorPort } from '@domain/agents/agent.port';
import type { AgentRunRepository } from '@domain/repositories/agent-run.repository';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { ContentRepository } from '@domain/repositories/content.repository';
import type { KnowledgeRepository } from '@domain/repositories/knowledge.repository';
import type { MetricsRepository } from '@domain/repositories/metrics.repository';
import type { RecommendationRepository } from '@domain/repositories/recommendation.repository';
import type { RecommendationType } from '@domain/types/agent-enums';
import { AppError } from '@shared/errors/app-error';
import { ensureMockMetrics } from '../../helpers/ensure-mock-metrics';
import type { RunMarketingAgentInput } from '../../dto/agent.dto';

function toRecommendationType(value: string): RecommendationType {
  const valid: RecommendationType[] = [
    'PUBLISH',
    'SCHEDULE',
    'RECYCLE',
    'CREATE_CONTENT',
    'PAUSE_CAMPAIGN',
    'REPEAT_CAMPAIGN',
    'CREATE_PROMOTION',
    'TARGET_AUDIENCE',
    'AD_BUDGET',
    'FUNNEL',
    'MONTHLY_PLAN',
    'OTHER',
  ];
  return valid.includes(value as RecommendationType)
    ? (value as RecommendationType)
    : 'OTHER';
}

export class RunMarketingAgentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly contentRepository: ContentRepository,
    private readonly metricsRepository: MetricsRepository,
    private readonly agentRunRepository: AgentRunRepository,
    private readonly recommendationRepository: RecommendationRepository,
    private readonly orchestrator: MarketingOrchestratorPort,
  ) {}

  async execute(userId: string, input: RunMarketingAgentInput): Promise<AgentRun> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const metrics = await ensureMockMetrics(company, this.metricsRepository);

    const [knowledgeDocs, recentContents] = await Promise.all([
      this.knowledgeRepository.findAllByCompanyId(company.id),
      this.contentRepository.findAllByCompanyId(company.id),
    ]);

    const knowledgeTexts = knowledgeDocs
      .map((doc) => doc.extractedText)
      .filter((text): text is string => Boolean(text));

    const run = await this.agentRunRepository.create({
      companyId: company.id,
      status: 'RUNNING',
      goal: input.goal ?? 'monthly_plan',
      startedAt: new Date(),
    });

    try {
      const output = await this.orchestrator.run({
        companyId: company.id,
        company,
        knowledgeTexts,
        recentContents: recentContents.slice(0, 20),
        metrics,
        goal: input.goal,
      });

      for (const step of output.steps) {
        await this.agentRunRepository.createStep({
          runId: run.id,
          agent: step.agent,
          status: step.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          input: step.input,
          output: step.output ?? undefined,
          provider: step.provider,
          model: step.model,
          latencyMs: step.latencyMs,
          error: step.error,
        });
      }

      if (output.recommendations.length > 0) {
        await this.recommendationRepository.createMany(
          output.recommendations.map((rec) => ({
            companyId: company.id,
            runId: run.id,
            type: toRecommendationType(rec.type),
            title: rec.title,
            description: rec.description,
            priority: rec.priority ?? 0,
            payload: rec.payload ?? null,
            status: 'PENDING',
          })),
        );
      }

      const completed = await this.agentRunRepository.update(run.id, {
        status: 'COMPLETED',
        summary: output.summary,
        plan: output.plan,
        finishedAt: new Date(),
      });

      const steps = await this.agentRunRepository.findStepsByRunId(run.id);
      const recommendations = await this.recommendationRepository.findAllByCompanyId(
        company.id,
      );

      return {
        ...completed,
        steps,
        recommendations: recommendations.filter((r) => r.runId === run.id),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Orchestrator failed';
      await this.agentRunRepository.update(run.id, {
        status: 'FAILED',
        error: message,
        finishedAt: new Date(),
      });
      throw err;
    }
  }
}
