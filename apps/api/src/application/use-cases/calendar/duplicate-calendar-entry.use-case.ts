// apps/api/src/application/use-cases/calendar/duplicate-calendar-entry.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity';
import { AppError } from '../../../shared/errors/app-error';

export class DuplicateCalendarEntryUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    entryId: string,
  ): Promise<CalendarEntry> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const entry = await this.calendarRepository.findByIdForCompany(entryId, companyId);
    if (!entry) {
      throw AppError.notFound('CalendarEntry', entryId);
    }

    const sourceContent = await this.contentRepository.findByIdForCompany(
      entry.contentId,
      companyId,
    );
    if (!sourceContent) {
      throw AppError.notFound('Content', entry.contentId);
    }

    const duplicateContent = await this.contentRepository.create({
      companyId,
      type: sourceContent.type,
      status: 'SCHEDULED',
      title: `${sourceContent.title} (copy)`,
      copy: sourceContent.copy,
      cta: sourceContent.cta,
      emojis: [...sourceContent.emojis],
      hashtags: [...sourceContent.hashtags],
      imagePrompt: sourceContent.imagePrompt,
      seoKeywords: [...sourceContent.seoKeywords],
      imageId: sourceContent.imageId,
      scheduledAt: entry.scheduledAt,
      currentVersion: 1,
    });

    await this.contentRepository.createVersion({
      contentId: duplicateContent.id,
      version: 1,
      title: duplicateContent.title,
      copy: duplicateContent.copy,
      cta: duplicateContent.cta,
      emojis: duplicateContent.emojis,
      hashtags: duplicateContent.hashtags,
      imagePrompt: duplicateContent.imagePrompt,
      seoKeywords: duplicateContent.seoKeywords,
      snapshot: { duplicatedFromEntry: entryId },
    });

    return this.calendarRepository.create({
      companyId,
      contentId: duplicateContent.id,
      scheduledAt: entry.scheduledAt,
      notes: entry.notes,
    });
  }
}
