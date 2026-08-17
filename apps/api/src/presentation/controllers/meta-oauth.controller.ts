// apps/api/src/presentation/controllers/meta-oauth.controller.ts

import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { COMPANY_REPOSITORY, PUBLISH_REPOSITORY } from '@domain/repositories/tokens';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import type { PublishRepository } from '@domain/repositories/publish.repository';
import { MetaOAuthService } from '@infrastructure/oauth/meta-oauth.service';
import { env } from '../../config/env';
import { AppError } from '@shared/errors/app-error';

@Controller('oauth/meta')
export class MetaOAuthController {
  constructor(
    @Inject(MetaOAuthService) private readonly metaOAuth: MetaOAuthService,
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
        throw new AppError(400, 'META_OAUTH_DENIED', errorDescription ?? error);
      }
      if (!code || !state) {
        throw new AppError(400, 'META_OAUTH_INVALID', 'Missing code or state');
      }

      const payload = this.metaOAuth.verifyState(state);
      const company = await this.companies.findByIdForUser(
        payload.companyId,
        payload.userId,
      );
      if (!company) {
        throw AppError.notFound('Company', payload.companyId);
      }

      const page = await this.metaOAuth.exchangeCode(code);

      await this.publish.upsertConnection({
        companyId: payload.companyId,
        platform: 'FACEBOOK',
        externalId: page.pageId,
        displayName: page.pageName,
        accessToken: page.pageAccessToken,
        connectedAt: new Date(),
        metadata: {
          pageId: page.pageId,
          instagramBusinessAccountId: page.instagramBusinessAccountId,
        },
      });

      if (page.instagramBusinessAccountId) {
        await this.publish.upsertConnection({
          companyId: payload.companyId,
          platform: 'INSTAGRAM',
          externalId: page.instagramBusinessAccountId,
          displayName: `${page.pageName} (Instagram)`,
          accessToken: page.pageAccessToken,
          connectedAt: new Date(),
          metadata: {
            pageId: page.pageId,
            instagramBusinessAccountId: page.instagramBusinessAccountId,
          },
        });
      }

      const igFlag = page.instagramBusinessAccountId ? 'connected' : 'page_only';
      res.redirect(
        `${env.WEB_URL}/companies/${payload.companyId}/connections?meta=${igFlag}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Meta OAuth failed';
      res.redirect(
        `${env.WEB_URL}/companies/oauth-error?message=${encodeURIComponent(message)}`,
      );
    }
  }
}
