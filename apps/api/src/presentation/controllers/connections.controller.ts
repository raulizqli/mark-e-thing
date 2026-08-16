// apps/api/src/presentation/controllers/connections.controller.ts

import { Body, Controller, Delete, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { ConnectWhatsAppUseCase } from '@application/use-cases/connections/connect-whatsapp.use-case';
import { DisconnectSocialUseCase } from '@application/use-cases/connections/disconnect-social.use-case';
import { ListConnectionsUseCase } from '@application/use-cases/connections/list-connections.use-case';
import { LinkedInOAuthService } from '@infrastructure/oauth/linkedin-oauth.service';
import { MetaOAuthService } from '@infrastructure/oauth/meta-oauth.service';
import { XOAuthService } from '@infrastructure/oauth/x-oauth.service';
import type { PublishPlatform } from '@domain/types/enums';
import type { RequestWithUser } from '../middleware/auth.middleware';

@Controller('companies/:companyId/connections')
export class ConnectionsController {
  constructor(
    @Inject(ListConnectionsUseCase) private readonly listConnections: ListConnectionsUseCase,
    @Inject(DisconnectSocialUseCase) private readonly disconnectSocial: DisconnectSocialUseCase,
    @Inject(ConnectWhatsAppUseCase) private readonly connectWhatsApp: ConnectWhatsAppUseCase,
    @Inject(LinkedInOAuthService) private readonly linkedInOAuth: LinkedInOAuthService,
    @Inject(MetaOAuthService) private readonly metaOAuth: MetaOAuthService,
    @Inject(XOAuthService) private readonly xOAuth: XOAuthService,
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
          defaultRecipient:
            typeof connection.metadata?.defaultRecipient === 'string'
              ? connection.metadata.defaultRecipient
              : null,
        })),
        linkedInConfigured: this.linkedInOAuth.isConfigured(),
        metaConfigured: this.metaOAuth.isConfigured(),
        xConfigured: this.xOAuth.isConfigured(),
        whatsappConfigured: true,
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

  @Get('x/authorize')
  authorizeX(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    const url = this.xOAuth.buildAuthorizeUrl(companyId, req.user!.id);
    return { success: true, data: { url } };
  }

  @Post('whatsapp')
  async connectWhatsAppAccount(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body()
    body: {
      accessToken: string;
      phoneNumberId: string;
      displayName?: string;
      defaultRecipient: string;
    },
  ) {
    const data = await this.connectWhatsApp.execute(req.user!.id, {
      companyId,
      accessToken: body.accessToken,
      phoneNumberId: body.phoneNumberId,
      displayName: body.displayName,
      defaultRecipient: body.defaultRecipient,
    });
    return {
      success: true,
      data: {
        id: data.id,
        platform: data.platform,
        displayName: data.displayName,
        externalId: data.externalId,
        connectedAt: data.connectedAt,
        hasToken: Boolean(data.accessToken),
        defaultRecipient: data.metadata?.defaultRecipient ?? null,
      },
    };
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
