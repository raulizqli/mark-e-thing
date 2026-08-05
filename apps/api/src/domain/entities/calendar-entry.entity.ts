// apps/api/src/domain/entities/calendar-entry.entity.ts

export interface CalendarEntry {
  id: string;
  companyId: string;
  contentId: string;
  scheduledAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCalendarEntryData = Pick<
  CalendarEntry,
  'companyId' | 'contentId' | 'scheduledAt'
> &
  Partial<Pick<CalendarEntry, 'notes'>>;

export type UpdateCalendarEntryData = Partial<
  Pick<CalendarEntry, 'scheduledAt' | 'notes'>
>;
