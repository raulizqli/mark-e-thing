// apps/api/src/infrastructure/prisma/calendar.prisma-repository.ts

import { Injectable } from '@nestjs/common';
import type {
  CalendarEntry,
  CreateCalendarEntryData,
  UpdateCalendarEntryData,
} from '@domain/entities/calendar-entry.entity.js';
import type { CalendarRepository } from '@domain/repositories/calendar.repository.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class CalendarPrismaRepository implements CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      orderBy: { scheduledAt: 'asc' },
    });
    return rows.map((row) => ({ ...row }));
  }

  async update(id: string, data: UpdateCalendarEntryData): Promise<CalendarEntry> {
    const row = await this.prisma.calendarEntry.update({ where: { id }, data });
    return { ...row };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.calendarEntry.delete({ where: { id } });
  }
}
