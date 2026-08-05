// apps/api/src/application/use-cases/content/regenerate-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { ContentGeneratorPort } from '../../../domain/services/content-generator.port';
import type { Content } from '../../../domain/entities/content.entity';
import type { RegenerateContentInput } from '../../dto/content.dto';
import { AppError } from '../../../shared/errors/app-error';

export class RegenerateContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentGenerator: ContentGeneratorPort,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    contentId: string,
    input: RegenerateContentInput = {},
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

    const knowledgeDocs = await this.knowledgeRepository.findAllByCompanyId(
      companyId,
    );
    const knowledgeTexts = knowledgeDocs
      .map((doc) => doc.extractedText)
      .filter((text): text is string => Boolean(text));

    const generated = await this.contentGenerator.generate({
      company,
      knowledgeTexts,
      contentType: existing.type,
      topic: input.topic ?? existing.title,
    });

    const nextVersion = existing.currentVersion + 1;
    const updated = await this.contentRepository.update(contentId, {
      title: generated.title,
      copy: generated.copy,
      cta: generated.cta ?? null,
      emojis: generated.emojis ?? [],
      hashtags: generated.hashtags ?? [],
      imagePrompt: generated.imagePrompt ?? null,
      seoKeywords: generated.seoKeywords ?? [],
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
      snapshot: { regenerated: true, topic: input.topic ?? null },
    });

    return updated;
  }
}
