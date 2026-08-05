// src/modules/analytics/analytics.routes.ts
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/validation/validate.js';
import { searchIdParamsSchema } from '../search/search.dto.js';
import { AnalyticsController } from './analytics.controller.js';

export function createAnalyticsRoutes(
  controller = new AnalyticsController(),
): Router {
  const router = Router();

  router.get(
    '/searches/:id/analytics',
    requireAuth,
    validate(searchIdParamsSchema, 'params'),
    asyncHandler((req, res) => controller.getSearchAnalytics(req, res)),
  );

  return router;
}
