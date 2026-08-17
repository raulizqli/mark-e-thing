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
} from '@domain/repositories/tokens';
import { createContentGenerator, createImageGenerator } from './ai/ai.factory';
import { LinkedInOAuthService } from './oauth/linkedin-oauth.service';
import { MetaOAuthService } from './oauth/meta-oauth.service';
import { XOAuthService } from './oauth/x-oauth.service';
import { CalendarPrismaRepository } from './prisma/calendar.prisma-repository';
import { CompanyPrismaRepository } from './prisma/company.prisma-repository';
import { ContentPrismaRepository } from './prisma/content.prisma-repository';
import { ImagePrismaRepository } from './prisma/image.prisma-repository';
import { KnowledgePrismaRepository } from './prisma/knowledge.prisma-repository';
import { PrismaService } from './prisma/prisma.service';
import { PublishPrismaRepository } from './prisma/publish.prisma-repository';
import { PublishAdapterRegistryService } from './publishing/publish-adapter.registry';
import { createStorageService } from './storage/storage.factory';

@Global()
@Module({
  providers: [
    PrismaService,
    LinkedInOAuthService,
    MetaOAuthService,
    XOAuthService,
    { provide: COMPANY_REPOSITORY, useClass: CompanyPrismaRepository },
    { provide: KNOWLEDGE_REPOSITORY, useClass: KnowledgePrismaRepository },
    { provide: CONTENT_REPOSITORY, useClass: ContentPrismaRepository },
    { provide: IMAGE_REPOSITORY, useClass: ImagePrismaRepository },
    { provide: CALENDAR_REPOSITORY, useClass: CalendarPrismaRepository },
    { provide: PUBLISH_REPOSITORY, useClass: PublishPrismaRepository },
    { provide: STORAGE_SERVICE, useFactory: createStorageService },
    { provide: CONTENT_GENERATOR, useFactory: createContentGenerator },
    { provide: IMAGE_GENERATOR, useFactory: createImageGenerator },
    { provide: PUBLISH_ADAPTER_REGISTRY, useClass: PublishAdapterRegistryService },
  ],
  exports: [
    PrismaService,
    LinkedInOAuthService,
    MetaOAuthService,
    XOAuthService,
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
