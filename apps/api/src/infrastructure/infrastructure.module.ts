// apps/api/src/infrastructure/infrastructure.module.ts

import { Global, Module } from '@nestjs/common';
import {
  CALENDAR_REPOSITORY,
  COMPANY_REPOSITORY,
  CONTENT_GENERATOR,
  CONTENT_REPOSITORY,
  IMAGE_GENERATOR,
  IMAGE_REPOSITORY,
  KNOWLEDGE_REPOSITORY,
  PUBLISH_ADAPTER_REGISTRY,
  PUBLISH_REPOSITORY,
  STORAGE_SERVICE,
} from '@domain/repositories/tokens.js';
import { createContentGenerator, createImageGenerator } from './ai/ai.factory.js';
import { CalendarPrismaRepository } from './prisma/calendar.prisma-repository.js';
import { CompanyPrismaRepository } from './prisma/company.prisma-repository.js';
import { ContentPrismaRepository } from './prisma/content.prisma-repository.js';
import { ImagePrismaRepository } from './prisma/image.prisma-repository.js';
import { KnowledgePrismaRepository } from './prisma/knowledge.prisma-repository.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PublishPrismaRepository } from './prisma/publish.prisma-repository.js';
import { FacebookAdapter } from './publishing/adapters/facebook.adapter.js';
import { InstagramAdapter } from './publishing/adapters/instagram.adapter.js';
import { LinkedinAdapter } from './publishing/adapters/linkedin.adapter.js';
import { WhatsappAdapter } from './publishing/adapters/whatsapp.adapter.js';
import { XAdapter } from './publishing/adapters/x.adapter.js';
import { PublishAdapterRegistryService } from './publishing/publish-adapter.registry.js';
import { LocalStorageService } from './storage/local-storage.service.js';

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
    { provide: STORAGE_SERVICE, useClass: LocalStorageService },
    { provide: CONTENT_GENERATOR, useFactory: createContentGenerator },
    { provide: IMAGE_GENERATOR, useFactory: createImageGenerator },
    FacebookAdapter,
    InstagramAdapter,
    WhatsappAdapter,
    LinkedinAdapter,
    XAdapter,
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
    STORAGE_SERVICE,
    CONTENT_GENERATOR,
    IMAGE_GENERATOR,
    PUBLISH_ADAPTER_REGISTRY,
  ],
})
export class InfrastructureModule {}
