// apps/api/src/infrastructure/oauth/meta-oauth.service.ts

import { Injectable } from '@nestjs/common';
import { env, hasMetaOAuth } from '../../config/env';
import { AppError } from '@shared/errors/app-error';
import { signOAuthState, verifyOAuthState } from './oauth-state';

const GRAPH = 'https://graph.facebook.com/v21.0';

const META_SCOPES = [
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
  'business_management',
].join(',');

interface MetaTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string };
}

export interface MetaPageConnection {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramBusinessAccountId: string | null;
}

@Injectable()
export class MetaOAuthService {
  isConfigured(): boolean {
    return hasMetaOAuth;
  }

  buildAuthorizeUrl(companyId: string, userId: string): string {
    if (!hasMetaOAuth) {
      throw new AppError(
        400,
        'META_NOT_CONFIGURED',
        'Set META_APP_ID and META_APP_SECRET to connect Facebook/Instagram',
      );
    }

    const state = signOAuthState({
      companyId,
      userId,
      provider: 'meta',
      exp: Date.now() + 10 * 60_000,
    });

    const params = new URLSearchParams({
      client_id: env.META_APP_ID!,
      redirect_uri: env.META_REDIRECT_URI,
      state,
      response_type: 'code',
      scope: META_SCOPES,
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  verifyState(state: string) {
    return verifyOAuthState(state, 'meta');
  }

  async exchangeCode(code: string): Promise<MetaPageConnection> {
    const shortLived = await this.requestToken({
      client_id: env.META_APP_ID!,
      client_secret: env.META_APP_SECRET!,
      redirect_uri: env.META_REDIRECT_URI,
      code,
    });

    const longLived = await this.requestToken({
      grant_type: 'fb_exchange_token',
      client_id: env.META_APP_ID!,
      client_secret: env.META_APP_SECRET!,
      fb_exchange_token: shortLived,
    });

    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(longLived)}`,
    );
    const pagesJson = (await pagesRes.json()) as {
      data?: Array<{
        id: string;
        name: string;
        access_token: string;
        instagram_business_account?: { id: string; username?: string };
      }>;
      error?: { message?: string };
    };

    if (!pagesRes.ok || !pagesJson.data?.length) {
      throw new AppError(
        400,
        'META_NO_PAGES',
        pagesJson.error?.message ??
          'No Facebook Pages found. Create/link a Page and grant pages_show_list.',
      );
    }

    const page = pagesJson.data[0];
    return {
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      instagramBusinessAccountId: page.instagram_business_account?.id ?? null,
    };
  }

  private async requestToken(params: Record<string, string>): Promise<string> {
    const url = `${GRAPH}/oauth/access_token?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url);
    const json = (await response.json()) as MetaTokenResponse;
    if (!response.ok || !json.access_token) {
      throw new AppError(
        502,
        'META_TOKEN_FAILED',
        json.error?.message ?? 'Meta token exchange failed',
      );
    }
    return json.access_token;
  }
}
