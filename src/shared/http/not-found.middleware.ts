// src/shared/http/not-found.middleware.ts
import type { Request, Response } from 'express';
import { errorResponse } from './api-response.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('Route not found'));
}
