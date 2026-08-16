// apps/api/src/presentation/controllers/x-oauth.controller.ts

import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { COMPANY_REPOSITORY, PUBLISH_REPOSITORY } from '@domain/repositories/tokens';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { PublishRepository } from '@domain/repositories/publish.repository';
import { XOAuthService } from '@infrastructure/oauth/x-oauth.service';
import { env } from '../../config/env';
import { AppError } from '@shared/errors/app-error';

@Controller('oauth/x')
export class XOAuthController {
  constructor(
    @Inject(XOAuthService) private readonly xOAuth: XOAuthService,
    @Inject(COMPANY_REPOSITORY) private readonly companies: CompanyRepository,
    @Inject(PUBLISH_REPOSITORY) private readonly publish: PublishRepository,
  ) {}

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        throw new AppError(400, 'X_OAUTH_DENIED', errorDescription ?? error);
      }
      if (!code || !state) {
        throw new AppError(400, 'X_OAUTH_INVALID', 'Missing code or state');
      }

      const payload = this.xOAuth.verifyState(state);
      if (!payload.codeVerifier) {
        throw new AppError(400, 'X_OAUTH_INVALID', 'Missing PKCE code verifier in state');
      }

      const company = await this.companies.findByIdForUser(
        payload.companyId,
        payload.userId,
      );
      if (!company) {
        throw AppError.notFound('Company', payload.companyId);
      }

      const tokens = await this.xOAuth.exchangeCode(code, payload.codeVerifier);
      await this.publish.upsertConnection({
        companyId: payload.companyId,
        platform: 'X',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        externalId: tokens.externalId,
        displayName: tokens.displayName,
        connectedAt: new Date(),
      });

      res.redirect(`${env.WEB_URL}/companies/${payload.companyId}/connections?x=connected`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'X OAuth failed';
      res.redirect(
        `${env.WEB_URL}/companies/oauth-error?message=${encodeURIComponent(message)}`,
      );
    }
  }
}
