// src/modules/analytics/analytics.controller.ts
import type { Request, Response } from 'express';
import { getAuthUser } from '../auth/auth.middleware.js';
import { successResponse } from '../../shared/http/api-response.js';
import { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService = new AnalyticsService(),
  ) {}

  async getSearchAnalytics(req: Request, res: Response): Promise<void> {
    const auth = getAuthUser(req);
    const analytics = await this.analyticsService.getSearchAnalytics(
      req.params.id,
      auth.userId,
    );
    res.status(200).json(successResponse(analytics));
  }
}
