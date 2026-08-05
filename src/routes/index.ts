// src/routes/index.ts
import { Router } from 'express';
import { createAnalyticsRoutes } from '../modules/analytics/analytics.routes.js';
import { createExportRoutes } from '../modules/export/export.routes.js';
import { createHealthRoutes } from '../modules/health/health.routes.js';
import { createSearchRoutes } from '../modules/search/search.routes.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use(createHealthRoutes());
  router.use('/searches', createSearchRoutes());
  router.use(createExportRoutes());
  router.use(createAnalyticsRoutes());

  return router;
}
