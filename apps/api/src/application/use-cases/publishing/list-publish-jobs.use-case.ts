// apps/api/src/application/use-cases/publishing/list-publish-jobs.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { PublishRepository } from '../../../domain/repositories/publish.repository.js';
import type { PublishJob } from '../../../domain/entities/publish.entity.js';
import type { PublishJobStatus, PublishPlatform } from '../../../domain/types/enums.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface ListPublishJobsInput {
  companyId: string;
  status?: PublishJobStatus;
  platform?: PublishPlatform;
  contentId?: string;
}

export class ListPublishJobsUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly publishRepository: PublishRepository,
  ) {}

  async execute(
    userId: string,
    input: ListPublishJobsInput,
  ): Promise<PublishJob[]> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    return this.publishRepository.findJobsByCompanyId(input.companyId, {
      status: input.status,
      platform: input.platform,
      contentId: input.contentId,
    });
  }
}
