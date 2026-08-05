// apps/api/src/application/use-cases/content/get-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { Content, ContentVersion } from '../../../domain/entities/content.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface ContentWithVersions {
  content: Content;
  versions: ContentVersion[];
}

export class GetContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    contentId: string,
  ): Promise<ContentWithVersions> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const content = await this.contentRepository.findByIdForCompany(
      contentId,
      companyId,
    );
    if (!content) {
      throw AppError.notFound('Content', contentId);
    }

    const versions =
      await this.contentRepository.findVersionsByContentId(contentId);

    return { content, versions };
  }
}
