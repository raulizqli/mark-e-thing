// src/modules/export/export.controller.ts
import type { Request, Response } from 'express';
import { getAuthUser } from '../auth/auth.middleware.js';
import type { ExportFormat } from './export.types.js';
import { ExportService } from './export.service.js';

export class ExportController {
  constructor(private readonly exportService: ExportService = new ExportService()) {}

  async exportSearch(req: Request, res: Response): Promise<void> {
    const auth = getAuthUser(req);
    const format = req.query.format as ExportFormat;
    const result = await this.exportService.exportSearch(
      req.params.id,
      auth.userId,
      format,
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.status(200).send(result.body);
  }
}
