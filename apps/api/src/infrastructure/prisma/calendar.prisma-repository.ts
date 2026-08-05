// apps/api/src/infrastructure/prisma/calendar.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  CalendarEntry,
  CreateCalendarEntryData,
  UpdateCalendarEntryData,
} from '@domain/entities/calendar-entry.entity';
import type { CalendarRepository } from '@domain/repositories/calendar.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class CalendarPrismaRepository implements CalendarRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: CreateCalendarEntryData): Promise<CalendarEntry> {
    const row = await this.prisma.calendarEntry.create({
      data: {
        companyId: data.companyId,
        contentId: data.contentId,
        scheduledAt: data.scheduledAt,
        notes: data.notes ?? null,
      },
    });
    return { ...row };
  }

  async findById(id: string): Promise<CalendarEntry | null> {
    const row = await this.prisma.calendarEntry.findUnique({ where: { id } });
    return row ? { ...row } : null;
  }

  async findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<CalendarEntry | null> {
    const row = await this.prisma.calendarEntry.findFirst({
      where: { id, companyId },
    });
    return row ? { ...row } : null;
  }

  async findByCompanyIdInRange(
    companyId: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEntry[]> {
    const rows = await this.prisma.calendarEntry.findMany({
      where: {
        companyId,
        scheduledAt: { gte: start, lte: end },
      },
      include: { content: true },
      orderBy: { scheduledAt: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      companyId: row.companyId,
      contentId: row.contentId,
      scheduledAt: row.scheduledAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      content: row.content
        ? {
            id: row.content.id,
            companyId: row.content.companyId,
            type: row.content.type,
            status: row.content.status,
            title: row.content.title,
            copy: row.content.copy,
            cta: row.content.cta,
            emojis: row.content.emojis,
            hashtags: row.content.hashtags,
            imagePrompt: row.content.imagePrompt,
            seoKeywords: row.content.seoKeywords,
            currentVersion: row.content.currentVersion,
            scheduledAt: row.content.scheduledAt,
            publishedAt: row.content.publishedAt,
            imageId: row.content.imageId,
            metadata: row.content.metadata as Record<string, unknown> | null,
            createdAt: row.content.createdAt,
            updatedAt: row.content.updatedAt,
          }
        : undefined,
    }));
  }

  async update(id: string, data: UpdateCalendarEntryData): Promise<CalendarEntry> {
    const row = await this.prisma.calendarEntry.update({ where: { id }, data });
    return { ...row };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.calendarEntry.delete({ where: { id } });
  }
}
