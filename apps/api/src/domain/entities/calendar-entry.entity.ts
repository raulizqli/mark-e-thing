// apps/api/src/domain/entities/calendar-entry.entity.ts

export interface CalendarEntry {
  id: string;
  companyId: string;
  contentId: string;
  scheduledAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  content?: {
    id: string;
    companyId: string;
    type: string;
    status: string;
    title: string;
    copy: string;
    cta: string | null;
    emojis: string[];
    hashtags: string[];
    imagePrompt: string | null;
    seoKeywords: string[];
    currentVersion: number;
    scheduledAt: Date | null;
    publishedAt: Date | null;
    imageId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type CreateCalendarEntryData = Pick<
  CalendarEntry,
  'companyId' | 'contentId' | 'scheduledAt'
> &
  Partial<Pick<CalendarEntry, 'notes'>>;

export type UpdateCalendarEntryData = Partial<
  Pick<CalendarEntry, 'scheduledAt' | 'notes'>
>;
