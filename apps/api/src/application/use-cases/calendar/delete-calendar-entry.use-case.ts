// apps/api/src/application/use-cases/calendar/delete-calendar-entry.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository';
import { AppError } from '../../../shared/errors/app-error';

export class DeleteCalendarEntryUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    entryId: string,
  ): Promise<void> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const entry = await this.calendarRepository.findByIdForCompany(
      entryId,
      companyId,
    );
    if (!entry) {
      throw AppError.notFound('CalendarEntry', entryId);
    }

    await this.contentRepository.update(entry.contentId, {
      status: 'DRAFT',
      scheduledAt: null,
    });

    await this.calendarRepository.delete(entryId);
  }
}
