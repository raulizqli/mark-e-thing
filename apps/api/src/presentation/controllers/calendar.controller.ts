// apps/api/src/presentation/controllers/calendar.controller.ts

import {
  Inject,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DeleteCalendarEntryUseCase } from '@application/use-cases/calendar/delete-calendar-entry.use-case';
import { DuplicateCalendarEntryUseCase } from '@application/use-cases/calendar/duplicate-calendar-entry.use-case';
import { ListCalendarUseCase } from '@application/use-cases/calendar/list-calendar.use-case';
import { RescheduleContentUseCase } from '@application/use-cases/calendar/reschedule-content.use-case';
import { ScheduleContentUseCase } from '@application/use-cases/calendar/schedule-content.use-case';
import type { RequestWithUser } from '../middleware/auth.middleware';

@Controller('companies/:companyId/calendar')
export class CalendarController {
  constructor(
    @Inject(ListCalendarUseCase) private readonly listCalendar: ListCalendarUseCase,
    @Inject(ScheduleContentUseCase) private readonly scheduleContent: ScheduleContentUseCase,
    @Inject(RescheduleContentUseCase) private readonly rescheduleContent: RescheduleContentUseCase,
    @Inject(DeleteCalendarEntryUseCase) private readonly deleteEntry: DeleteCalendarEntryUseCase,
    @Inject(DuplicateCalendarEntryUseCase) private readonly duplicateEntry: DuplicateCalendarEntryUseCase,
  ) {}

  @Get()
  async list(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Query('month') month: string,
  ) {
    const [yearStr, monthStr] = month.split('-');
    const data = await this.listCalendar.execute(req.user!.id, {
      companyId,
      year: Number(yearStr),
      month: Number(monthStr),
    });
    return { success: true, data };
  }

  @Post()
  async schedule(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: { contentId: string; scheduledAt: string; notes?: string },
  ) {
    const data = await this.scheduleContent.execute(req.user!.id, {
      companyId,
      contentId: body.contentId,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes ?? null,
    });
    return { success: true, data };
  }

  @Patch(':entryId')
  async reschedule(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('entryId') entryId: string,
    @Body() body: { scheduledAt: string; notes?: string },
  ) {
    const data = await this.rescheduleContent.execute(
      req.user!.id,
      companyId,
      entryId,
      {
        scheduledAt: new Date(body.scheduledAt),
        notes: body.notes ?? null,
      },
    );
    return { success: true, data };
  }

  @Delete(':entryId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('entryId') entryId: string,
  ) {
    await this.deleteEntry.execute(req.user!.id, companyId, entryId);
    return { success: true, data: { deleted: true } };
  }

  @Post(':entryId/duplicate')
  async duplicate(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('entryId') entryId: string,
  ) {
    const data = await this.duplicateEntry.execute(req.user!.id, companyId, entryId);
    return { success: true, data };
  }
}
