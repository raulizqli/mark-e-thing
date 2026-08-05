// apps/api/src/presentation/controllers/knowledge.controller.ts

import {
  Inject,
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
import { memoryStorage } from 'multer';
import { DeleteKnowledgeUseCase } from '@application/use-cases/knowledge/delete-knowledge.use-case';
import { ListKnowledgeUseCase } from '@application/use-cases/knowledge/list-knowledge.use-case';
import { UploadKnowledgeUseCase } from '@application/use-cases/knowledge/upload-knowledge.use-case';
import type { KnowledgeType } from '@domain/types/enums';
import { extractText } from '@infrastructure/parsers/text-extractor';
import { AppError } from '@shared/errors/app-error';
import type { RequestWithUser } from '../middleware/dev-user.middleware';

@Controller('companies/:companyId/knowledge')
export class KnowledgeController {
  constructor(
    @Inject(UploadKnowledgeUseCase) private readonly uploadKnowledge: UploadKnowledgeUseCase,
    @Inject(ListKnowledgeUseCase) private readonly listKnowledge: ListKnowledgeUseCase,
    @Inject(DeleteKnowledgeUseCase) private readonly deleteKnowledge: DeleteKnowledgeUseCase,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('type') type?: KnowledgeType,
  ) {
    if (!file) {
      throw new AppError(400, 'FILE_REQUIRED', 'File is required');
    }

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
