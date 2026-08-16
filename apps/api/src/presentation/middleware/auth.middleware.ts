// apps/api/src/presentation/middleware/auth.middleware.ts

import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env, hasSupabaseAuth } from '../../config/env';
import type { AuthUser } from '../types/auth-user';
import { UserSyncService } from '../services/user-sync.service';

export type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(@Inject(UserSyncService) private readonly userSync: UserSyncService) {}

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    void this.authenticate(req, res, next);
  }

  private async authenticate(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!hasSupabaseAuth || env.AUTH_MODE === 'dev') {
        req.user = {
          id: env.DEV_USER_ID,
          email: env.DEV_USER_EMAIL,
          name: env.DEV_USER_NAME,
        };
        next();
        return;
      }

      const header = req.headers.authorization;
      if (!header?.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing Bearer token' },
        });
        return;
      }

      const token = header.slice('Bearer '.length).trim();
      const claims = await this.verifySupabaseToken(token);
      const email = typeof claims.email === 'string' ? claims.email : null;
      const sub = typeof claims.sub === 'string' ? claims.sub : null;
      if (!email || !sub) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid token claims' },
        });
        return;
      }

      const name =
        typeof claims.user_metadata === 'object' &&
        claims.user_metadata &&
        'full_name' in claims.user_metadata &&
        typeof (claims.user_metadata as { full_name?: unknown }).full_name === 'string'
          ? (claims.user_metadata as { full_name: string }).full_name
          : null;

      req.user = await this.userSync.upsertFromAuth({ id: sub, email, name });
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized';
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message },
      });
    }
  }

  private async verifySupabaseToken(token: string): Promise<Record<string, unknown>> {
    // Prefer asymmetric JWKS (newer Supabase projects); fall back to HS256 secret.
    if (env.SUPABASE_URL) {
      try {
        if (!this.jwks) {
          this.jwks = createRemoteJWKSet(
            new URL(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`),
          );
        }
        const { payload } = await jwtVerify(token, this.jwks, {
          audience: 'authenticated',
        });
        return payload as Record<string, unknown>;
      } catch {
        // fall through to shared secret
      }
    }

    if (!env.SUPABASE_JWT_SECRET) {
      throw new Error('SUPABASE_JWT_SECRET is required for AUTH_MODE=supabase');
    }

    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: 'authenticated',
    });
    return payload as Record<string, unknown>;
  }
}
