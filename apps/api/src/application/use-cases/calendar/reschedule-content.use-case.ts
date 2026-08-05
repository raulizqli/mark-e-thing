// apps/api/src/application/use-cases/calendar/reschedule-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.js';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity.js';
import type { RescheduleContentInput } from '../../dto/calendar.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class RescheduleContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    entryId: string,
    input: RescheduleContentInput,
  ): Promise<CalendarEntry> {
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
      scheduledAt: input.scheduledAt,
    });

    return this.calendarRepository.update(entryId, {
      scheduledAt: input.scheduledAt,
      notes: input.notes,
    });
  }
}
