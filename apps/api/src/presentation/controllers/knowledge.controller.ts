// apps/api/src/presentation/controllers/knowledge.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteKnowledgeUseCase } from '@application/use-cases/knowledge/delete-knowledge.use-case.js';
import { ListKnowledgeUseCase } from '@application/use-cases/knowledge/list-knowledge.use-case.js';
import { UploadKnowledgeUseCase } from '@application/use-cases/knowledge/upload-knowledge.use-case.js';
import type { KnowledgeType } from '@domain/types/enums.js';
import { extractText } from '@infrastructure/parsers/text-extractor.js';
import type { RequestWithUser } from '../middleware/dev-user.middleware.js';

@Controller('companies/:companyId/knowledge')
export class KnowledgeController {
  constructor(
    private readonly uploadKnowledge: UploadKnowledgeUseCase,
    private readonly listKnowledge: ListKnowledgeUseCase,
    private readonly deleteKnowledge: DeleteKnowledgeUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('type') type?: KnowledgeType,
  ) {
    const data = await this.uploadKnowledge.execute(req.user!.id, {
      companyId,
      title: title ?? file.originalname,
      type: type ?? 'OTHER',
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileBuffer: file.buffer,
      extractedText: extractText(file.buffer, file.mimetype, file.originalname),
    });
    return { success: true, data };
  }

  @Get()
  async list(@Req() req: RequestWithUser, @Param('companyId') companyId: string) {
    const data = await this.listKnowledge.execute(req.user!.id, { companyId });
    return { success: true, data };
  }

  @Delete(':docId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('docId') docId: string,
  ) {
    await this.deleteKnowledge.execute(req.user!.id, companyId, docId);
    return { success: true, data: { deleted: true } };
  }
}
