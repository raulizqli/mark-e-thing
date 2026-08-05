// apps/api/src/application/use-cases/content/duplicate-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { Content } from '../../../domain/entities/content.entity';
import type { DuplicateContentInput } from '../../dto/content.dto';
import { AppError } from '../../../shared/errors/app-error';

export class DuplicateContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    contentId: string,
    input: DuplicateContentInput = {},
  ): Promise<Content> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const source = await this.contentRepository.findByIdForCompany(
      contentId,
      companyId,
    );
    if (!source) {
      throw AppError.notFound('Content', contentId);
    }

    const duplicateTitle = input.title ?? `${source.title} (copy)`;

    const duplicate = await this.contentRepository.create({
      companyId,
      type: source.type,
      status: 'DRAFT',
      title: duplicateTitle,
      copy: source.copy,
      cta: source.cta,
      emojis: [...source.emojis],
      hashtags: [...source.hashtags],
      imagePrompt: source.imagePrompt,
      seoKeywords: [...source.seoKeywords],
      imageId: source.imageId,
      metadata: source.metadata,
      currentVersion: 1,
    });

    await this.contentRepository.createVersion({
      contentId: duplicate.id,
      version: 1,
      title: duplicate.title,
      copy: duplicate.copy,
      cta: duplicate.cta,
      emojis: duplicate.emojis,
      hashtags: duplicate.hashtags,
      imagePrompt: duplicate.imagePrompt,
      seoKeywords: duplicate.seoKeywords,
      snapshot: { duplicatedFrom: source.id },
    });

    return duplicate;
  }
}
