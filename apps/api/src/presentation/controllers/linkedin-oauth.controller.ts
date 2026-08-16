// apps/api/src/presentation/controllers/linkedin-oauth.controller.ts

import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { COMPANY_REPOSITORY, PUBLISH_REPOSITORY } from '@domain/repositories/tokens';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { PublishRepository } from '@domain/repositories/publish.repository';
import { LinkedInOAuthService } from '@infrastructure/oauth/linkedin-oauth.service';
import { env } from '../../config/env';
import { AppError } from '@shared/errors/app-error';

@Controller('oauth/linkedin')
export class LinkedInOAuthController {
  constructor(
    @Inject(LinkedInOAuthService) private readonly linkedInOAuth: LinkedInOAuthService,
    @Inject(COMPANY_REPOSITORY) private readonly companies: CompanyRepository,
    @Inject(PUBLISH_REPOSITORY) private readonly publish: PublishRepository,
  ) {}

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        throw new AppError(400, 'LINKEDIN_OAUTH_DENIED', error);
      }
      if (!code || !state) {
        throw new AppError(400, 'LINKEDIN_OAUTH_INVALID', 'Missing code or state');
      }

      const payload = this.linkedInOAuth.verifyState(state);
      const company = await this.companies.findByIdForUser(
        payload.companyId,
        payload.userId,
      );
      if (!company) {
        throw AppError.notFound('Company', payload.companyId);
      }

      const tokens = await this.linkedInOAuth.exchangeCode(code);
      await this.publish.upsertConnection({
        companyId: payload.companyId,
        platform: 'LINKEDIN',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        externalId: tokens.externalId,
        displayName: tokens.displayName,
        connectedAt: new Date(),
      });

      res.redirect(
        `${env.WEB_URL}/companies/${payload.companyId}/connections?linkedin=connected`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'LinkedIn OAuth failed';
      res.redirect(
        `${env.WEB_URL}/companies/oauth-error?message=${encodeURIComponent(message)}`,
      );
    }
  }
}
