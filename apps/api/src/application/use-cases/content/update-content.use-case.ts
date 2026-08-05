// apps/api/src/application/use-cases/content/update-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { Content } from '../../../domain/entities/content.entity.js';
import type { UpdateContentInput } from '../../dto/content.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class UpdateContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    contentId: string,
    input: UpdateContentInput,
  ): Promise<Content> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const existing = await this.contentRepository.findByIdForCompany(
      contentId,
      companyId,
    );
    if (!existing) {
      throw AppError.notFound('Content', contentId);
    }

    const nextVersion = existing.currentVersion + 1;
    const updated = await this.contentRepository.update(contentId, {
      ...input,
      currentVersion: nextVersion,
    });

    await this.contentRepository.createVersion({
      contentId,
      version: nextVersion,
      title: updated.title,
      copy: updated.copy,
      cta: updated.cta,
      emojis: updated.emojis,
      hashtags: updated.hashtags,
      imagePrompt: updated.imagePrompt,
      seoKeywords: updated.seoKeywords,
      snapshot: {
        previousVersion: existing.currentVersion,
        updatedFields: Object.keys(input),
      },
    });

    return updated;
  }
}
