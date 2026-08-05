// apps/api/src/presentation/presentation.module.ts

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { AgentsController } from './controllers/agents.controller';
import { CalendarController } from './controllers/calendar.controller';
import { CompaniesController } from './controllers/companies.controller';
import { ContentController } from './controllers/content.controller';
import { HealthController } from './controllers/health.controller';
import { ImagesController } from './controllers/images.controller';
import { KnowledgeController } from './controllers/knowledge.controller';
import { PublishingController } from './controllers/publishing.controller';
import { DevUserMiddleware } from './middleware/dev-user.middleware';
import { DevUserBootstrapService } from './services/dev-user-bootstrap.service';

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
    AgentsController,
  ],
  providers: [DevUserBootstrapService, DevUserMiddleware],
})
export class PresentationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DevUserMiddleware).exclude('health').forRoutes('*');
  }
}
