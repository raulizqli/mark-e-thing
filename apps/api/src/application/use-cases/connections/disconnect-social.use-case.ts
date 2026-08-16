// apps/api/src/application/use-cases/connections/disconnect-social.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { PublishRepository } from '../../../domain/repositories/publish.repository';
import type { PublishPlatform } from '../../../domain/types/enums';
import { AppError } from '../../../shared/errors/app-error';

export class DisconnectSocialUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly publishRepository: PublishRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    platform: PublishPlatform,
  ): Promise<void> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }
    await this.publishRepository.deleteConnection(companyId, platform);
  }
}
