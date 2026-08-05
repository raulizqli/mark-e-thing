// apps/api/src/application/use-cases/agents/list-recommendations.use-case.ts

import type { Recommendation } from '@domain/entities/agent.entity';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { RecommendationRepository } from '@domain/repositories/recommendation.repository';
import { AppError } from '@shared/errors/app-error';
import type { ListRecommendationsQuery } from '../../dto/agent.dto';

export class ListRecommendationsUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    query?: ListRecommendationsQuery,
  ): Promise<Recommendation[]> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    return this.recommendationRepository.findAllByCompanyId(companyId, {
      status: query?.status,
    });
  }
}
