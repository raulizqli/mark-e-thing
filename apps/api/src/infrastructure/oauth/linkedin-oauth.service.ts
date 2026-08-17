// apps/api/src/infrastructure/oauth/linkedin-oauth.service.ts

import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { env, hasLinkedInOAuth } from '../../config/env';
import { AppError } from '@shared/errors/app-error';

interface OAuthStatePayload {
  companyId: string;
  userId: string;
  exp: number;
}

interface LinkedInTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

interface LinkedInUserInfo {
  sub?: string;
  name?: string;
  email?: string;
}

@Injectable()
export class LinkedInOAuthService {
  isConfigured(): boolean {
    return hasLinkedInOAuth;
  }

  buildAuthorizeUrl(companyId: string, userId: string): string {
    if (!hasLinkedInOAuth) {
      throw new AppError(
        400,
        'LINKEDIN_NOT_CONFIGURED',
        'Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to connect LinkedIn',
      );
    }

    const state = this.signState({ companyId, userId, exp: Date.now() + 10 * 60_000 });
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.LINKEDIN_CLIENT_ID!,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
      state,
      scope: 'openid profile email w_member_social',
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  verifyState(state: string): OAuthStatePayload {
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
    return payload;
  }

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string | null;
    externalId: string;
    displayName: string | null;
  }> {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINKEDIN_REDIRECT_URI,
        client_id: env.LINKEDIN_CLIENT_ID!,
        client_secret: env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    const tokenJson = (await tokenRes.json()) as LinkedInTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new AppError(
        502,
        'LINKEDIN_TOKEN_FAILED',
        tokenJson.error_description ?? tokenJson.error ?? 'LinkedIn token exchange failed',
      );
    }

    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profile = (await profileRes.json()) as LinkedInUserInfo;
    if (!profileRes.ok || !profile.sub) {
      throw new AppError(502, 'LINKEDIN_PROFILE_FAILED', 'Could not load LinkedIn profile');
    }

    return {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token ?? null,
      externalId: `urn:li:person:${profile.sub}`,
      displayName: profile.name ?? profile.email ?? null,
    };
  }

  private signState(payload: OAuthStatePayload): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
    return `${body}.${signature}`;
  }
}
