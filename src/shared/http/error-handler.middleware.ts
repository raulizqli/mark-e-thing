// src/shared/http/error-handler.middleware.ts
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../logger/logger.js';
import { errorResponse } from './api-response.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    } else {
      logger.warn({ err }, err.message);
    }

    res.status(err.statusCode).json(errorResponse(err.message, err.details));
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json(errorResponse('Internal server error'));
}
