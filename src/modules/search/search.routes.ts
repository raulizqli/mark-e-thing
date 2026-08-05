// src/modules/search/search.routes.ts
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/validation/validate.js';
import { SearchController } from './search.controller.js';
import { createSearchSchema, searchIdParamsSchema } from './search.dto.js';

export function createSearchRoutes(
  controller = new SearchController(),
): Router {
  const router = Router();

  router.use(requireAuth);

  router.post(
    '/',
    validate(createSearchSchema),
    asyncHandler((req, res) => controller.create(req, res)),
  );

  router.get(
    '/:id',
    validate(searchIdParamsSchema, 'params'),
    asyncHandler((req, res) => controller.getById(req, res)),
  );

  router.get(
    '/:id/status',
    validate(searchIdParamsSchema, 'params'),
    asyncHandler((req, res) => controller.getStatus(req, res)),
  );

  return router;
}
