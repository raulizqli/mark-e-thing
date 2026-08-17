// apps/api/src/application/use-cases/connections/list-connections.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { PublishRepository } from '../../../domain/repositories/publish.repository';
import type { SocialConnection } from '../../../domain/entities/publish.entity';
import { AppError } from '../../../shared/errors/app-error';

export class ListConnectionsUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly publishRepository: PublishRepository,
  ) {}

  async execute(userId: string, companyId: string): Promise<SocialConnection[]> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }
    return this.publishRepository.listConnections(companyId);
  }
}
