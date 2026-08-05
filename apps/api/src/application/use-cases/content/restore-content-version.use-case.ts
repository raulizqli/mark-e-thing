// apps/api/src/application/use-cases/content/restore-content-version.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { Content } from '../../../domain/entities/content.entity';
import type { RestoreContentVersionInput } from '../../dto/content.dto';
import { AppError } from '../../../shared/errors/app-error';

export class RestoreContentVersionUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    contentId: string,
    input: RestoreContentVersionInput,
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

    const versionSnapshot = await this.contentRepository.findVersion(
      contentId,
      input.version,
    );
    if (!versionSnapshot) {
      throw AppError.notFound('ContentVersion', String(input.version));
    }

    const nextVersion = existing.currentVersion + 1;
    const restored = await this.contentRepository.update(contentId, {
      title: versionSnapshot.title,
      copy: versionSnapshot.copy,
      cta: versionSnapshot.cta,
      emojis: versionSnapshot.emojis,
      hashtags: versionSnapshot.hashtags,
      imagePrompt: versionSnapshot.imagePrompt,
      seoKeywords: versionSnapshot.seoKeywords,
      currentVersion: nextVersion,
    });

    await this.contentRepository.createVersion({
      contentId,
      version: nextVersion,
      title: restored.title,
      copy: restored.copy,
      cta: restored.cta,
      emojis: restored.emojis,
      hashtags: restored.hashtags,
      imagePrompt: restored.imagePrompt,
      seoKeywords: restored.seoKeywords,
      snapshot: { restoredFromVersion: input.version },
    });

    return restored;
  }
}
