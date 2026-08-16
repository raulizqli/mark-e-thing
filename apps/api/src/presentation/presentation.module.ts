// apps/api/src/presentation/presentation.module.ts

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { CalendarController } from './controllers/calendar.controller';
import { CompaniesController } from './controllers/companies.controller';
import { ConnectionsController } from './controllers/connections.controller';
import { ContentController } from './controllers/content.controller';
import { HealthController } from './controllers/health.controller';
import { ImagesController } from './controllers/images.controller';
import { KnowledgeController } from './controllers/knowledge.controller';
import { LinkedInOAuthController } from './controllers/linkedin-oauth.controller';
import { MetaOAuthController } from './controllers/meta-oauth.controller';
import { MeController } from './controllers/me.controller';
import { PublishingController } from './controllers/publishing.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { DevUserBootstrapService } from './services/dev-user-bootstrap.service';
import { UserSyncService } from './services/user-sync.service';

@Module({
  imports: [ApplicationModule],
  controllers: [
    HealthController,
    MeController,
    CompaniesController,
    KnowledgeController,
    ContentController,
    ImagesController,
    CalendarController,
    PublishingController,
    ConnectionsController,
    LinkedInOAuthController,
    MetaOAuthController,
  ],
  providers: [DevUserBootstrapService, UserSyncService, AuthMiddleware],
})
export class PresentationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .exclude('health', 'oauth/linkedin/callback', 'oauth/meta/callback')
      .forRoutes('*');
  }
}
