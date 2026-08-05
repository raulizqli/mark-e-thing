// apps/api/src/presentation/controllers/publishing.controller.ts

import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { EnqueuePublishUseCase } from '@application/use-cases/publishing/enqueue-publish.use-case.js';
import { ListPublishJobsUseCase } from '@application/use-cases/publishing/list-publish-jobs.use-case.js';
import type { PublishJobStatus, PublishPlatform } from '@domain/types/enums.js';
import type { RequestWithUser } from '../middleware/dev-user.middleware.js';

@Controller('companies/:companyId/publish')
export class PublishingController {
  constructor(
    private readonly enqueuePublish: EnqueuePublishUseCase,
    private readonly listJobs: ListPublishJobsUseCase,
  ) {}

  @Post()
  async enqueue(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: { contentId: string; platform: PublishPlatform; scheduledAt?: string },
  ) {
    const data = await this.enqueuePublish.execute(req.user!.id, {
      companyId,
      contentId: body.contentId,
      platform: body.platform,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
    return { success: true, data };
  }

  @Get('jobs')
  async jobs(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Query('status') status?: PublishJobStatus,
    @Query('platform') platform?: PublishPlatform,
    @Query('contentId') contentId?: string,
  ) {
    const data = await this.listJobs.execute(req.user!.id, {
      companyId,
      status,
      platform,
      contentId,
    });
    return { success: true, data };
  }
}
