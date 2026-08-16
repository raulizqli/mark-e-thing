// apps/api/src/presentation/controllers/connections.controller.ts

import { Inject, Controller, Delete, Get, Param, Req } from '@nestjs/common';
import { DisconnectSocialUseCase } from '@application/use-cases/connections/disconnect-social.use-case';
import { ListConnectionsUseCase } from '@application/use-cases/connections/list-connections.use-case';
import { LinkedInOAuthService } from '@infrastructure/oauth/linkedin-oauth.service';
import { MetaOAuthService } from '@infrastructure/oauth/meta-oauth.service';
import type { PublishPlatform } from '@domain/types/enums';
import type { RequestWithUser } from '../middleware/auth.middleware';

@Controller('companies/:companyId/connections')
export class ConnectionsController {
  constructor(
    @Inject(ListConnectionsUseCase) private readonly listConnections: ListConnectionsUseCase,
    @Inject(DisconnectSocialUseCase) private readonly disconnectSocial: DisconnectSocialUseCase,
    @Inject(LinkedInOAuthService) private readonly linkedInOAuth: LinkedInOAuthService,
    @Inject(MetaOAuthService) private readonly metaOAuth: MetaOAuthService,
  ) {}

  @Get()
  async list(@Req() req: RequestWithUser, @Param('companyId') companyId: string) {
    const data = await this.listConnections.execute(req.user!.id, companyId);
    return {
      success: true,
      data: {
        connections: data.map((connection) => ({
          id: connection.id,
          platform: connection.platform,
          displayName: connection.displayName,
          externalId: connection.externalId,
          connectedAt: connection.connectedAt,
          hasToken: Boolean(connection.accessToken),
        })),
        linkedInConfigured: this.linkedInOAuth.isConfigured(),
        metaConfigured: this.metaOAuth.isConfigured(),
      },
    };
  }

  @Get('linkedin/authorize')
  authorizeLinkedIn(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    const url = this.linkedInOAuth.buildAuthorizeUrl(companyId, req.user!.id);
    return { success: true, data: { url } };
  }

  @Get('meta/authorize')
  authorizeMeta(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    const url = this.metaOAuth.buildAuthorizeUrl(companyId, req.user!.id);
    return { success: true, data: { url } };
  }

  @Delete(':platform')
  async disconnect(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('platform') platform: PublishPlatform,
  ) {
    await this.disconnectSocial.execute(req.user!.id, companyId, platform);
    return { success: true, data: { deleted: true } };
  }
}
