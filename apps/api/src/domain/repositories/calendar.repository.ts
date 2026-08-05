// apps/api/src/domain/repositories/calendar.repository.ts

import type {
  CalendarEntry,
  CreateCalendarEntryData,
  UpdateCalendarEntryData,
} from '../entities/calendar-entry.entity.js';

export interface CalendarRepository {
  create(data: CreateCalendarEntryData): Promise<CalendarEntry>;
  findById(id: string): Promise<CalendarEntry | null>;
  findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<CalendarEntry | null>;
  findByCompanyIdInRange(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEntry[]>;
  update(id: string, data: UpdateCalendarEntryData): Promise<CalendarEntry>;
  delete(id: string): Promise<void>;
}
