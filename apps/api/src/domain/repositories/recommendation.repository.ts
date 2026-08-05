// apps/api/src/domain/repositories/recommendation.repository.ts

import type {
  CreateRecommendationData,
  Recommendation,
  UpdateRecommendationData,
} from '../entities/agent.entity';
import type { RecommendationStatus } from '../types/agent-enums';

export interface RecommendationListFilters {
  status?: RecommendationStatus;
}

export interface RecommendationRepository {
  create(data: CreateRecommendationData): Promise<Recommendation>;
  createMany(data: CreateRecommendationData[]): Promise<Recommendation[]>;
  findById(id: string): Promise<Recommendation | null>;
  findByIdForCompany(id: string, companyId: string): Promise<Recommendation | null>;
  findAllByCompanyId(
    companyId: string,
    filters?: RecommendationListFilters,
  ): Promise<Recommendation[]>;
  update(id: string, data: UpdateRecommendationData): Promise<Recommendation>;
}
