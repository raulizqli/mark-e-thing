// src/modules/export/export.routes.ts
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/validation/validate.js';
import { ExportController } from './export.controller.js';
import { exportParamsSchema, exportQuerySchema } from './export.dto.js';

export function createExportRoutes(
  controller = new ExportController(),
): Router {
  const router = Router();

  router.get(
    '/searches/:id/export',
    requireAuth,
    validate(exportParamsSchema, 'params'),
    validate(exportQuerySchema, 'query'),
    asyncHandler((req, res) => controller.exportSearch(req, res)),
  );

  return router;
}
