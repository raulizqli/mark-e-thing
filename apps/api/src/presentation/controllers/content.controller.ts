// apps/api/src/presentation/controllers/content.controller.ts

import {
  Inject,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DuplicateContentUseCase } from '@application/use-cases/content/duplicate-content.use-case';
import { GenerateContentUseCase } from '@application/use-cases/content/generate-content.use-case';
import { GetContentUseCase } from '@application/use-cases/content/get-content.use-case';
import { ListContentUseCase } from '@application/use-cases/content/list-content.use-case';
import { ListContentVersionsUseCase } from '@application/use-cases/content/list-content-versions.use-case';
import { RegenerateContentUseCase } from '@application/use-cases/content/regenerate-content.use-case';
import { RestoreContentVersionUseCase } from '@application/use-cases/content/restore-content-version.use-case';
import { UpdateContentUseCase } from '@application/use-cases/content/update-content.use-case';
import type {
  DuplicateContentInput,
  RegenerateContentInput,
  UpdateContentInput,
} from '@application/dto/content.dto';
import type { ContentStatus, ContentType } from '@domain/types/enums';
import type { RequestWithUser } from '../middleware/dev-user.middleware';

@Controller('companies/:companyId/content')
export class ContentController {
  constructor(
    @Inject(GenerateContentUseCase) private readonly generateContent: GenerateContentUseCase,
    @Inject(ListContentUseCase) private readonly listContent: ListContentUseCase,
    @Inject(GetContentUseCase) private readonly getContent: GetContentUseCase,
    @Inject(UpdateContentUseCase) private readonly updateContent: UpdateContentUseCase,
    @Inject(DuplicateContentUseCase) private readonly duplicateContent: DuplicateContentUseCase,
    @Inject(RegenerateContentUseCase) private readonly regenerateContent: RegenerateContentUseCase,
    @Inject(ListContentVersionsUseCase) private readonly listVersions: ListContentVersionsUseCase,
    @Inject(RestoreContentVersionUseCase) private readonly restoreVersion: RestoreContentVersionUseCase,
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
