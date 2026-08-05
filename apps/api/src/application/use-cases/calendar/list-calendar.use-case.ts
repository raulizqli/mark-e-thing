// apps/api/src/application/use-cases/calendar/list-calendar.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity';
import type { ListCalendarInput } from '../../dto/calendar.dto';
import { AppError } from '../../../shared/errors/app-error';

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
