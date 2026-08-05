// apps/api/src/application/use-cases/agents/run-marketing-agent.use-case.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunMarketingAgentUseCase } from './run-marketing-agent.use-case';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { KnowledgeRepository } from '@domain/repositories/knowledge.repository';
import type { ContentRepository } from '@domain/repositories/content.repository';
import type { MetricsRepository } from '@domain/repositories/metrics.repository';
import type { AgentRunRepository } from '@domain/repositories/agent-run.repository';
import type { RecommendationRepository } from '@domain/repositories/recommendation.repository';
import type { MarketingOrchestratorPort } from '@domain/agents/agent.port';
import type { Company } from '@domain/entities/company.entity';
import type { MetricsSnapshot } from '@domain/entities/agent.entity';
import { AppError } from '@shared/errors/app-error';

const userId = 'user-1';
const companyId = 'company-1';

const company: Company = {
  id: companyId,
  userId,
  name: 'Acme Co',
  description: null,
  industry: 'retail',
  services: ['consulting'],
  products: ['widgets'],
  promotions: [],
  city: 'NYC',
  website: null,
  socialFacebook: null,
  socialInstagram: 'acme',
  socialLinkedin: null,
  socialX: null,
  socialWhatsapp: null,
  primaryColor: null,
  secondaryColor: null,
  accentColor: null,
  logoUrl: null,
  typography: null,
  targetAudience: null,
  toneOfVoice: 'professional',
  forbiddenWords: [],
  preferredCtas: ['Learn more'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const metrics: MetricsSnapshot = {
  id: 'metrics-1',
  companyId,
  platform: 'ALL',
  periodStart: new Date('2026-07-01'),
  periodEnd: new Date('2026-07-31'),
  reach: 1000,
  likes: 50,
  comments: 10,
  shares: 5,
  conversions: 2,
  bestHours: [9, 12, 18],
  raw: null,
  source: 'mock',
  createdAt: new Date(),
};

describe('RunMarketingAgentUseCase', () => {
  let companyRepository: CompanyRepository;
  let knowledgeRepository: KnowledgeRepository;
  let contentRepository: ContentRepository;
  let metricsRepository: MetricsRepository;
  let agentRunRepository: AgentRunRepository;
  let recommendationRepository: RecommendationRepository;
  let orchestrator: MarketingOrchestratorPort;
  let useCase: RunMarketingAgentUseCase;

  beforeEach(() => {
    companyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForUser: vi.fn().mockResolvedValue(company),
      findAllByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    knowledgeRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    };

    contentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      createVersion: vi.fn(),
      findVersion: vi.fn(),
      findVersionsByContentId: vi.fn(),
    };

    metricsRepository = {
      create: vi.fn().mockResolvedValue(metrics),
      findLatestByCompanyId: vi.fn(),
      findRecentByCompanyId: vi.fn().mockResolvedValue(null),
    };

    agentRunRepository = {
      create: vi.fn().mockResolvedValue({
        id: 'run-1',
        companyId,
        status: 'RUNNING',
        goal: 'monthly_plan',
        summary: null,
        plan: null,
        error: null,
        startedAt: new Date(),
        finishedAt: null,
        createdAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({
        id: 'run-1',
        companyId,
        status: 'COMPLETED',
        goal: 'monthly_plan',
        summary: 'Done',
        plan: { weeklyPlan: [] },
        error: null,
        startedAt: new Date(),
        finishedAt: new Date(),
        createdAt: new Date(),
      }),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn(),
      createStep: vi.fn().mockResolvedValue({}),
      findStepsByRunId: vi.fn().mockResolvedValue([
        { id: 'step-1', runId: 'run-1', agent: 'ANALYTICS', status: 'COMPLETED' },
      ]),
    };

    recommendationRepository = {
      create: vi.fn(),
      createMany: vi.fn().mockResolvedValue([
        {
          id: 'rec-1',
          companyId,
          runId: 'run-1',
          type: 'CREATE_CONTENT',
          title: 'Test',
          description: 'Test rec',
          priority: 5,
          payload: null,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn().mockResolvedValue([
        {
          id: 'rec-1',
          companyId,
          runId: 'run-1',
          type: 'CREATE_CONTENT',
          title: 'Test',
          description: 'Test rec',
          priority: 5,
          payload: null,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      update: vi.fn(),
    };

    orchestrator = {
      run: vi.fn().mockResolvedValue({
        summary: 'Marketing plan ready',
        plan: { weeklyPlan: [] },
        steps: [
          {
            agent: 'ANALYTICS',
            status: 'COMPLETED',
            input: {},
            output: {},
            provider: 'heuristic',
            model: null,
            latencyMs: 1,
            error: null,
            result: null,
          },
        ],
        recommendations: [
          {
            type: 'CREATE_CONTENT',
            title: 'Test',
            description: 'Test rec',
            priority: 5,
          },
        ],
      }),
    };

    useCase = new RunMarketingAgentUseCase(
      companyRepository,
      knowledgeRepository,
      contentRepository,
      metricsRepository,
      agentRunRepository,
      recommendationRepository,
      orchestrator,
    );
  });

  it('creates mock metrics, runs orchestrator, and persists run', async () => {
    const result = await useCase.execute(userId, { companyId, goal: 'monthly_plan' });

    expect(metricsRepository.findRecentByCompanyId).toHaveBeenCalled();
    expect(metricsRepository.create).toHaveBeenCalled();
    expect(orchestrator.run).toHaveBeenCalled();
    expect(agentRunRepository.createStep).toHaveBeenCalled();
    expect(recommendationRepository.createMany).toHaveBeenCalled();
    expect(result.status).toBe('COMPLETED');
    expect(result.steps?.length).toBeGreaterThan(0);
  });

  it('throws 404 when company is not found', async () => {
    vi.mocked(companyRepository.findByIdForUser).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, { companyId: 'missing' }),
    ).rejects.toEqual(AppError.notFound('Company', 'missing'));
  });
});
