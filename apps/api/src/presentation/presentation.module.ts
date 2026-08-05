// apps/api/src/presentation/presentation.module.ts

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module.js';
import { CalendarController } from './controllers/calendar.controller.js';
import { CompaniesController } from './controllers/companies.controller.js';
import { ContentController } from './controllers/content.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { ImagesController } from './controllers/images.controller.js';
import { KnowledgeController } from './controllers/knowledge.controller.js';
import { PublishingController } from './controllers/publishing.controller.js';
import { DevUserMiddleware } from './middleware/dev-user.middleware.js';
import { DevUserBootstrapService } from './services/dev-user-bootstrap.service.js';

@Module({
  imports: [ApplicationModule],
  controllers: [
    HealthController,
    CompaniesController,
    KnowledgeController,
    ContentController,
    ImagesController,
    CalendarController,
    PublishingController,
  ],
  providers: [DevUserBootstrapService, DevUserMiddleware],
})
export class PresentationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DevUserMiddleware).exclude('health').forRoutes('*');
  }
}
