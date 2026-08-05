// apps/api/src/presentation/filters/app-error.filter.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppError } from '@shared/errors/app-error.js';

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({
        success: false,
        error: {
          message: exception.message,
          code: exception.code,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json({
        success: false,
        error: typeof body === 'string' ? { message: body } : body,
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });
  }
}
