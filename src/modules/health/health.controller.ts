// src/modules/health/health.controller.ts
import type { Request, Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { successResponse } from '../../shared/http/api-response.js';

export class HealthController {
  liveness(_req: Request, res: Response): void {
    res.status(200).json(successResponse({ status: 'ok' }));
  }

  async readiness(_req: Request, res: Response): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json(successResponse({ status: 'ready' }));
  }
}
