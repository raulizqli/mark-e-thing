// apps/api/src/infrastructure/oauth/x-oauth.service.ts

import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { env, hasXOAuth } from '../../config/env';
import { AppError } from '@shared/errors/app-error';
import { signOAuthState, verifyOAuthState } from './oauth-state';

@Injectable()
export class XOAuthService {
  isConfigured(): boolean {
    return hasXOAuth;
  }

  buildAuthorizeUrl(companyId: string, userId: string): string {
    if (!hasXOAuth) {
      throw new AppError(
        400,
        'X_NOT_CONFIGURED',
        'Set X_CLIENT_ID and X_CLIENT_SECRET to connect X',
      );
    }

    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const state = signOAuthState({
      companyId,
      userId,
      provider: 'x',
      exp: Date.now() + 10 * 60_000,
      codeVerifier,
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.X_CLIENT_ID!,
      redirect_uri: env.X_REDIRECT_URI,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  verifyState(state: string) {
    return verifyOAuthState(state, 'x');
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<{
    accessToken: string;
    refreshToken: string | null;
    externalId: string;
    displayName: string | null;
  }> {
    const basic = Buffer.from(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: env.X_CLIENT_ID!,
        redirect_uri: env.X_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new AppError(
        502,
        'X_TOKEN_FAILED',
        tokenJson.error_description ?? tokenJson.error ?? 'X token exchange failed',
      );
    }

    const meRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const meJson = (await meRes.json()) as {
      data?: { id: string; name?: string; username?: string };
      detail?: string;
      title?: string;
    };

    if (!meRes.ok || !meJson.data?.id) {
      throw new AppError(
        502,
        'X_PROFILE_FAILED',
        meJson.detail ?? meJson.title ?? 'Could not load X profile',
      );
    }

    return {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token ?? null,
      externalId: meJson.data.id,
      displayName: meJson.data.username
        ? `@${meJson.data.username}`
        : meJson.data.name ?? null,
    };
  }
}
