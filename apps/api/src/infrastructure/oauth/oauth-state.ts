// apps/api/src/infrastructure/oauth/oauth-state.ts

import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';
import { AppError } from '@shared/errors/app-error';

export interface OAuthStatePayload {
  companyId: string;
  userId: string;
  provider: string;
  exp: number;
}

export function signOAuthState(payload: OAuthStatePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyOAuthState(state: string, provider?: string): OAuthStatePayload {
  const [body, signature] = state.split('.');
  if (!body || !signature) {
    throw new AppError(400, 'INVALID_OAUTH_STATE', 'Invalid OAuth state');
  }
  const expected = createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new AppError(400, 'INVALID_OAUTH_STATE', 'OAuth state signature mismatch');
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthStatePayload;
  if (payload.exp < Date.now()) {
    throw new AppError(400, 'INVALID_OAUTH_STATE', 'OAuth state expired');
  }
  if (provider && payload.provider !== provider) {
    throw new AppError(400, 'INVALID_OAUTH_STATE', 'OAuth provider mismatch');
  }
  return payload;
}
