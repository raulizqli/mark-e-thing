// apps/api/src/application/use-cases/content/generate-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { ContentGeneratorPort } from '../../../domain/services/content-generator.port';
import type { Content } from '../../../domain/entities/content.entity';
import type { GenerateContentInput } from '../../dto/content.dto';
import type { QuotaService } from '../../services/quota.service';
import { AppError } from '../../../shared/errors/app-error';

export class GenerateContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentGenerator: ContentGeneratorPort,
    private readonly quotaService?: QuotaService,
  ) {}

  async execute(
    userId: string,
    input: GenerateContentInput,
  ): Promise<Content> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    if (this.quotaService) {
      await this.quotaService.assertAndConsume(userId, 'content');
    }

    const knowledgeDocs = await this.knowledgeRepository.findAllByCompanyId(
      input.companyId,
    );
    const knowledgeTexts = knowledgeDocs
      .map((doc) => doc.extractedText)
      .filter((text): text is string => Boolean(text));

    const generated = await this.contentGenerator.generate({
      company,
      knowledgeTexts,
      contentType: input.type,
      topic: input.topic,
    });

    const content = await this.contentRepository.create({
      companyId: input.companyId,
      type: input.type,
      status: 'DRAFT',
      title: generated.title,
      copy: generated.copy,
      cta: generated.cta ?? null,
      emojis: generated.emojis ?? [],
      hashtags: generated.hashtags ?? [],
      imagePrompt: generated.imagePrompt ?? null,
      seoKeywords: generated.seoKeywords ?? [],
      currentVersion: 1,
    });

    await this.contentRepository.createVersion({
      contentId: content.id,
      version: 1,
      title: content.title,
      copy: content.copy,
      cta: content.cta,
      emojis: content.emojis,
      hashtags: content.hashtags,
      imagePrompt: content.imagePrompt,
      seoKeywords: content.seoKeywords,
    });

    return content;
  }
}
