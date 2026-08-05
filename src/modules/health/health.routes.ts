// src/modules/health/health.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { HealthController } from './health.controller.js';

export function createHealthRoutes(controller = new HealthController()): Router {
  const router = Router();

  router.get('/health', (req, res) => controller.liveness(req, res));
  router.get(
    '/ready',
    asyncHandler((req, res) => controller.readiness(req, res)),
  );

  return router;
}
