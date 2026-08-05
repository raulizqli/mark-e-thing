// apps/api/src/presentation/controllers/content.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DuplicateContentUseCase } from '@application/use-cases/content/duplicate-content.use-case.js';
import { GenerateContentUseCase } from '@application/use-cases/content/generate-content.use-case.js';
import { GetContentUseCase } from '@application/use-cases/content/get-content.use-case.js';
import { ListContentUseCase } from '@application/use-cases/content/list-content.use-case.js';
import { ListContentVersionsUseCase } from '@application/use-cases/content/list-content-versions.use-case.js';
import { RegenerateContentUseCase } from '@application/use-cases/content/regenerate-content.use-case.js';
import { RestoreContentVersionUseCase } from '@application/use-cases/content/restore-content-version.use-case.js';
import { UpdateContentUseCase } from '@application/use-cases/content/update-content.use-case.js';
import type {
  DuplicateContentInput,
  RegenerateContentInput,
  UpdateContentInput,
} from '@application/dto/content.dto.js';
import type { ContentStatus, ContentType } from '@domain/types/enums.js';
import type { RequestWithUser } from '../middleware/dev-user.middleware.js';

@Controller('companies/:companyId/content')
export class ContentController {
  constructor(
    private readonly generateContent: GenerateContentUseCase,
    private readonly listContent: ListContentUseCase,
    private readonly getContent: GetContentUseCase,
    private readonly updateContent: UpdateContentUseCase,
    private readonly duplicateContent: DuplicateContentUseCase,
    private readonly regenerateContent: RegenerateContentUseCase,
    private readonly listVersions: ListContentVersionsUseCase,
    private readonly restoreVersion: RestoreContentVersionUseCase,
  ) {}

  @Post('generate')
  async generate(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: { type: ContentType; topic?: string },
  ) {
    const data = await this.generateContent.execute(req.user!.id, {
      companyId,
      type: body.type,
      topic: body.topic,
    });
    return { success: true, data };
  }

  @Get()
  async list(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Query('status') status?: ContentStatus,
    @Query('type') type?: ContentType,
  ) {
    const data = await this.listContent.execute(req.user!.id, {
      companyId,
      status,
      type,
    });
    return { success: true, data };
  }

  @Get(':contentId')
  async get(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
  ) {
    const data = await this.getContent.execute(req.user!.id, companyId, contentId);
    return { success: true, data };
  }

  @Patch(':contentId')
  async update(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
    @Body() body: UpdateContentInput,
  ) {
    const data = await this.updateContent.execute(
      req.user!.id,
      companyId,
      contentId,
      body,
    );
    return { success: true, data };
  }

  @Post(':contentId/duplicate')
  async duplicate(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
    @Body() body: DuplicateContentInput,
  ) {
    const data = await this.duplicateContent.execute(
      req.user!.id,
      companyId,
      contentId,
      body,
    );
    return { success: true, data };
  }

  @Post(':contentId/regenerate')
  async regenerate(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
    @Body() body: RegenerateContentInput,
  ) {
    const data = await this.regenerateContent.execute(
      req.user!.id,
      companyId,
      contentId,
      body,
    );
    return { success: true, data };
  }

  @Get(':contentId/versions')
  async versions(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
  ) {
    const data = await this.listVersions.execute(req.user!.id, companyId, contentId);
    return { success: true, data };
  }

  @Post(':contentId/versions/:version/restore')
  async restore(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('contentId') contentId: string,
    @Param('version') version: string,
  ) {
    const data = await this.restoreVersion.execute(req.user!.id, companyId, contentId, {
      version: Number(version),
    });
    return { success: true, data };
  }
}
