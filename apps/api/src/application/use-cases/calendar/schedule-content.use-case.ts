// apps/api/src/application/use-cases/calendar/schedule-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.js';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity.js';
import type { ScheduleContentInput } from '../../dto/calendar.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class ScheduleContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(
    userId: string,
    input: ScheduleContentInput,
  ): Promise<CalendarEntry> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const content = await this.contentRepository.findByIdForCompany(
      input.contentId,
      input.companyId,
    );
    if (!content) {
      throw AppError.notFound('Content', input.contentId);
    }

    await this.contentRepository.update(input.contentId, {
      status: 'SCHEDULED',
      scheduledAt: input.scheduledAt,
    });

    return this.calendarRepository.create({
      companyId: input.companyId,
      contentId: input.contentId,
      scheduledAt: input.scheduledAt,
      notes: input.notes ?? null,
    });
  }
}
