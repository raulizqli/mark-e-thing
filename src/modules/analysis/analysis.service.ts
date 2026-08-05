// src/modules/analysis/analysis.service.ts
import type { BusinessAnalysis, DigitalPresence, Prisma } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { prisma } from '../../shared/prisma/client.js';
import { LlmService } from '../llm/llm.service.js';
import { ScoringEngine } from '../scoring/scoring.engine.js';
import { AnalysisRepository } from './analysis.repository.js';

export class AnalysisService {
  constructor(
    private readonly analysisRepository: AnalysisRepository = new AnalysisRepository(),
    private readonly scoringEngine: ScoringEngine = new ScoringEngine(),
    private readonly llmService: LlmService = new LlmService(),
  ) {}

  async analyzeBusiness(businessId: string): Promise<BusinessAnalysis> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { digitalPresence: true },
    });

    if (!business) {
      throw new NotFoundError(`Business ${businessId} not found`);
    }

    const digitalPresence: DigitalPresence | null =
      business.digitalPresence ?? null;

    const scoring = this.scoringEngine.score({
      business,
      digitalPresence,
    });

    const generation = await this.llmService.generateAnalysis({
      business,
      digitalPresence,
      scoring,
    });

    return this.analysisRepository.create({
      businessId,
      leadScore: scoring.leadScore,
      priority: scoring.priority,
      scoringRules: scoring.scoringRules as unknown as Prisma.InputJsonValue,
      aiNeeds: generation.aiNeeds as Prisma.InputJsonValue,
      summary: generation.summary,
      opportunities: generation.opportunities,
      salesProposal: generation.salesProposal,
      coldEmail: generation.coldEmail,
      whatsappMessage: generation.whatsappMessage,
    });
  }
}
