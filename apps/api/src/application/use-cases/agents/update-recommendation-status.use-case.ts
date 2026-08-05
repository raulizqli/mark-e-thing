// apps/api/src/application/use-cases/agents/update-recommendation-status.use-case.ts

import type { Recommendation } from '@domain/entities/agent.entity';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { RecommendationRepository } from '@domain/repositories/recommendation.repository';
import type { RecommendationStatus } from '@domain/types/agent-enums';
import { AppError } from '@shared/errors/app-error';
import type { UpdateRecommendationStatusInput } from '../../dto/agent.dto';

const ALLOWED: RecommendationStatus[] = ['ACCEPTED', 'REJECTED'];

export class UpdateRecommendationStatusUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    recommendationId: string,
    input: UpdateRecommendationStatusInput,
  ): Promise<Recommendation> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    if (!ALLOWED.includes(input.status)) {
      throw new AppError(
        400,
        'INVALID_STATUS',
        `Status must be one of: ${ALLOWED.join(', ')}`,
      );
    }

    const recommendation = await this.recommendationRepository.findByIdForCompany(
      recommendationId,
      companyId,
    );
    if (!recommendation) {
      throw AppError.notFound('Recommendation', recommendationId);
    }

    return this.recommendationRepository.update(recommendationId, {
      status: input.status,
    });
  }
}
