// src/modules/auth/auth.middleware.ts
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { AuthService } from './auth.service.js';
import './auth.types.js';

export function createRequireAuth(authService = new AuthService()) {
  return async function requireAuth(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const header = req.header('authorization');
      if (!header?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing Bearer token');
      }

      const token = header.slice('Bearer '.length).trim();
      if (!token) {
        throw new UnauthorizedError('Missing Bearer token');
      }

      req.auth = await authService.authenticateBearerToken(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireAuth = createRequireAuth();

export function getAuthUser(req: Request) {
  if (!req.auth) {
    throw new UnauthorizedError('Authentication required');
  }
  return req.auth;
}
