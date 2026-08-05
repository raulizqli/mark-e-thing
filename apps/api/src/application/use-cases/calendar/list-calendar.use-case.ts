// apps/api/src/application/use-cases/calendar/list-calendar.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.js';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity.js';
import type { ListCalendarInput } from '../../dto/calendar.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class ListCalendarUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(
    userId: string,
    input: ListCalendarInput,
  ): Promise<CalendarEntry[]> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const start = new Date(input.year, input.month - 1, 1);
    const end = new Date(input.year, input.month, 0, 23, 59, 59, 999);

    return this.calendarRepository.findByCompanyIdInRange(
      input.companyId,
      start,
      end,
    );
  }
}
