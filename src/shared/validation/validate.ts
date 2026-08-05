// src/shared/validation/validate.ts
import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../errors/app-error.js';

type RequestTarget = 'body' | 'query' | 'params';

export function validate<T>(schema: ZodSchema<T>, target: RequestTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(
        new ValidationError('Request validation failed', result.error.flatten()),
      );
      return;
    }

    req[target] = result.data as Request[typeof target];
    next();
  };
}
