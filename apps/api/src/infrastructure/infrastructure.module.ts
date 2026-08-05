// apps/api/src/infrastructure/infrastructure.module.ts

import { Global, Module } from '@nestjs/common';
import {
  AGENT_RUN_REPOSITORY,
  AI_GATEWAY,
  AI_SETTINGS_REPOSITORY,
  CALENDAR_REPOSITORY,
  COMPANY_REPOSITORY,
  CONTENT_GENERATOR,
  CONTENT_REPOSITORY,
  IMAGE_GENERATOR,
  IMAGE_REPOSITORY,
  KNOWLEDGE_REPOSITORY,
  MARKETING_ORCHESTRATOR,
  METRICS_REPOSITORY,
  PUBLISH_ADAPTER_REGISTRY,
  PUBLISH_REPOSITORY,
  RECOMMENDATION_REPOSITORY,
  STORAGE_SERVICE,
} from '@domain/repositories/tokens';
import { createAiGateway } from './ai/ai.factory';
import { GatewayContentGenerator } from './ai/gateway-content.generator';
import { GatewayImageGenerator } from './ai/gateway-image.generator';
import { MarketingOrchestratorService } from './agents/orchestrator.service';
import { AgentRunPrismaRepository } from './prisma/agent-run.prisma-repository';
import { AiSettingsPrismaRepository } from './prisma/ai-settings.prisma-repository';
import { CalendarPrismaRepository } from './prisma/calendar.prisma-repository';
import { CompanyPrismaRepository } from './prisma/company.prisma-repository';
import { ContentPrismaRepository } from './prisma/content.prisma-repository';
import { ImagePrismaRepository } from './prisma/image.prisma-repository';
import { KnowledgePrismaRepository } from './prisma/knowledge.prisma-repository';
import { MetricsPrismaRepository } from './prisma/metrics.prisma-repository';
import { PrismaService } from './prisma/prisma.service';
import { PublishPrismaRepository } from './prisma/publish.prisma-repository';
import { RecommendationPrismaRepository } from './prisma/recommendation.prisma-repository';
import { PublishAdapterRegistryService } from './publishing/publish-adapter.registry';
import { LocalStorageService } from './storage/local-storage.service';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: COMPANY_REPOSITORY, useClass: CompanyPrismaRepository },
    { provide: KNOWLEDGE_REPOSITORY, useClass: KnowledgePrismaRepository },
    { provide: CONTENT_REPOSITORY, useClass: ContentPrismaRepository },
    { provide: IMAGE_REPOSITORY, useClass: ImagePrismaRepository },
    { provide: CALENDAR_REPOSITORY, useClass: CalendarPrismaRepository },
    { provide: PUBLISH_REPOSITORY, useClass: PublishPrismaRepository },
    { provide: AGENT_RUN_REPOSITORY, useClass: AgentRunPrismaRepository },
    { provide: RECOMMENDATION_REPOSITORY, useClass: RecommendationPrismaRepository },
    { provide: METRICS_REPOSITORY, useClass: MetricsPrismaRepository },
    { provide: AI_SETTINGS_REPOSITORY, useClass: AiSettingsPrismaRepository },
    { provide: STORAGE_SERVICE, useClass: LocalStorageService },
    { provide: AI_GATEWAY, useFactory: createAiGateway },
    {
      provide: CONTENT_GENERATOR,
      useFactory: (gateway) => new GatewayContentGenerator(gateway),
      inject: [AI_GATEWAY],
    },
    {
      provide: IMAGE_GENERATOR,
      useFactory: (gateway) => new GatewayImageGenerator(gateway),
      inject: [AI_GATEWAY],
    },
    {
      provide: MARKETING_ORCHESTRATOR,
      useFactory: (gateway) => new MarketingOrchestratorService(gateway),
      inject: [AI_GATEWAY],
    },
    { provide: PUBLISH_ADAPTER_REGISTRY, useClass: PublishAdapterRegistryService },
  ],
  exports: [
    PrismaService,
    COMPANY_REPOSITORY,
    KNOWLEDGE_REPOSITORY,
    CONTENT_REPOSITORY,
    IMAGE_REPOSITORY,
    CALENDAR_REPOSITORY,
    PUBLISH_REPOSITORY,
    AGENT_RUN_REPOSITORY,
    RECOMMENDATION_REPOSITORY,
    METRICS_REPOSITORY,
    AI_SETTINGS_REPOSITORY,
    MARKETING_ORCHESTRATOR,
    AI_GATEWAY,
    STORAGE_SERVICE,
    CONTENT_GENERATOR,
    IMAGE_GENERATOR,
    PUBLISH_ADAPTER_REGISTRY,
  ],
})
export class InfrastructureModule {}
