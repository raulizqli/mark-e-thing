// apps/api/src/application/dto/calendar.dto.ts

export interface ListCalendarInput {
  companyId: string;
  year: number;
  month: number;
}

export interface ScheduleContentInput {
  companyId: string;
  contentId: string;
  scheduledAt: Date;
  notes?: string | null;
}

export interface RescheduleContentInput {
  scheduledAt: Date;
  notes?: string | null;
}
