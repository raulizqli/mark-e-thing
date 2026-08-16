// apps/api/src/application/application.module.ts

import { Module } from '@nestjs/common';
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
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { CreateCompanyUseCase } from './use-cases/companies/create-company.use-case';
import { DeleteCompanyUseCase } from './use-cases/companies/delete-company.use-case';
import { GetCompanyUseCase } from './use-cases/companies/get-company.use-case';
import { ListCompaniesUseCase } from './use-cases/companies/list-companies.use-case';
import { UpdateCompanyUseCase } from './use-cases/companies/update-company.use-case';
import { DeleteCalendarEntryUseCase } from './use-cases/calendar/delete-calendar-entry.use-case';
import { DuplicateCalendarEntryUseCase } from './use-cases/calendar/duplicate-calendar-entry.use-case';
import { ListCalendarUseCase } from './use-cases/calendar/list-calendar.use-case';
import { RescheduleContentUseCase } from './use-cases/calendar/reschedule-content.use-case';
import { ScheduleContentUseCase } from './use-cases/calendar/schedule-content.use-case';
import { DuplicateContentUseCase } from './use-cases/content/duplicate-content.use-case';
import { GenerateContentUseCase } from './use-cases/content/generate-content.use-case';
import { GetContentUseCase } from './use-cases/content/get-content.use-case';
import { ListContentUseCase } from './use-cases/content/list-content.use-case';
import { ListContentVersionsUseCase } from './use-cases/content/list-content-versions.use-case';
import { RegenerateContentUseCase } from './use-cases/content/regenerate-content.use-case';
import { RestoreContentVersionUseCase } from './use-cases/content/restore-content-version.use-case';
import { UpdateContentUseCase } from './use-cases/content/update-content.use-case';
import { GenerateImageUseCase } from './use-cases/images/generate-image.use-case';
import { DeleteKnowledgeUseCase } from './use-cases/knowledge/delete-knowledge.use-case';
import { ListKnowledgeUseCase } from './use-cases/knowledge/list-knowledge.use-case';
import { UploadKnowledgeUseCase } from './use-cases/knowledge/upload-knowledge.use-case';
import { EnqueuePublishUseCase } from './use-cases/publishing/enqueue-publish.use-case';
import { ListPublishJobsUseCase } from './use-cases/publishing/list-publish-jobs.use-case';
import { DisconnectSocialUseCase } from './use-cases/connections/disconnect-social.use-case';
import { ListConnectionsUseCase } from './use-cases/connections/list-connections.use-case';
import { ConnectWhatsAppUseCase } from './use-cases/connections/connect-whatsapp.use-case';
import { QuotaService } from './services/quota.service';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    {
      provide: QuotaService,
      useFactory: (prisma: PrismaService) => new QuotaService(prisma),
      inject: [PrismaService],
    },
    {
      provide: ListCompaniesUseCase,
      useFactory: (repo) => new ListCompaniesUseCase(repo),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: CreateCompanyUseCase,
      useFactory: (repo) => new CreateCompanyUseCase(repo),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: GetCompanyUseCase,
      useFactory: (repo) => new GetCompanyUseCase(repo),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: UpdateCompanyUseCase,
      useFactory: (repo) => new UpdateCompanyUseCase(repo),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: DeleteCompanyUseCase,
      useFactory: (repo) => new DeleteCompanyUseCase(repo),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: UploadKnowledgeUseCase,
      useFactory: (companies, knowledge, storage) =>
        new UploadKnowledgeUseCase(companies, knowledge, storage),
      inject: [COMPANY_REPOSITORY, KNOWLEDGE_REPOSITORY, STORAGE_SERVICE],
    },
    {
      provide: ListKnowledgeUseCase,
      useFactory: (companies, knowledge) =>
        new ListKnowledgeUseCase(companies, knowledge),
      inject: [COMPANY_REPOSITORY, KNOWLEDGE_REPOSITORY],
    },
    {
      provide: DeleteKnowledgeUseCase,
      useFactory: (companies, knowledge, storage) =>
        new DeleteKnowledgeUseCase(companies, knowledge, storage),
      inject: [COMPANY_REPOSITORY, KNOWLEDGE_REPOSITORY, STORAGE_SERVICE],
    },
    {
      provide: GenerateContentUseCase,
      useFactory: (companies, knowledge, contents, generator, quota) =>
        new GenerateContentUseCase(companies, knowledge, contents, generator, quota),
      inject: [
        COMPANY_REPOSITORY,
        KNOWLEDGE_REPOSITORY,
        CONTENT_REPOSITORY,
        CONTENT_GENERATOR,
        QuotaService,
      ],
    },
    {
      provide: ListContentUseCase,
      useFactory: (companies, contents) =>
        new ListContentUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: GetContentUseCase,
      useFactory: (companies, contents) =>
        new GetContentUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: UpdateContentUseCase,
      useFactory: (companies, contents) =>
        new UpdateContentUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: DuplicateContentUseCase,
      useFactory: (companies, contents) =>
        new DuplicateContentUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: RegenerateContentUseCase,
      useFactory: (companies, knowledge, contents, generator, quota) =>
        new RegenerateContentUseCase(companies, knowledge, contents, generator, quota),
      inject: [
        COMPANY_REPOSITORY,
        KNOWLEDGE_REPOSITORY,
        CONTENT_REPOSITORY,
        CONTENT_GENERATOR,
        QuotaService,
      ],
    },
    {
      provide: ListContentVersionsUseCase,
      useFactory: (companies, contents) =>
        new ListContentVersionsUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: RestoreContentVersionUseCase,
      useFactory: (companies, contents) =>
        new RestoreContentVersionUseCase(companies, contents),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY],
    },
    {
      provide: GenerateImageUseCase,
      useFactory: (companies, contents, images, generator, storage, quota) =>
        new GenerateImageUseCase(companies, contents, images, generator, storage, quota),
      inject: [
        COMPANY_REPOSITORY,
        CONTENT_REPOSITORY,
        IMAGE_REPOSITORY,
        IMAGE_GENERATOR,
        STORAGE_SERVICE,
        QuotaService,
      ],
    },
    {
      provide: ListCalendarUseCase,
      useFactory: (companies, calendar) =>
        new ListCalendarUseCase(companies, calendar),
      inject: [COMPANY_REPOSITORY, CALENDAR_REPOSITORY],
    },
    {
      provide: ScheduleContentUseCase,
      useFactory: (companies, contents, calendar) =>
        new ScheduleContentUseCase(companies, contents, calendar),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY, CALENDAR_REPOSITORY],
    },
    {
      provide: RescheduleContentUseCase,
      useFactory: (companies, contents, calendar) =>
        new RescheduleContentUseCase(companies, contents, calendar),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY, CALENDAR_REPOSITORY],
    },
    {
      provide: DeleteCalendarEntryUseCase,
      useFactory: (companies, contents, calendar) =>
        new DeleteCalendarEntryUseCase(companies, contents, calendar),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY, CALENDAR_REPOSITORY],
    },
    {
      provide: DuplicateCalendarEntryUseCase,
      useFactory: (companies, contents, calendar) =>
        new DuplicateCalendarEntryUseCase(companies, contents, calendar),
      inject: [COMPANY_REPOSITORY, CONTENT_REPOSITORY, CALENDAR_REPOSITORY],
    },
    {
      provide: EnqueuePublishUseCase,
      useFactory: (companies, contents, publish, registry) =>
        new EnqueuePublishUseCase(companies, contents, publish, registry),
      inject: [
        COMPANY_REPOSITORY,
        CONTENT_REPOSITORY,
        PUBLISH_REPOSITORY,
        PUBLISH_ADAPTER_REGISTRY,
      ],
    },
    {
      provide: ListPublishJobsUseCase,
      useFactory: (companies, publish) =>
        new ListPublishJobsUseCase(companies, publish),
      inject: [COMPANY_REPOSITORY, PUBLISH_REPOSITORY],
    },
    {
      provide: ListConnectionsUseCase,
      useFactory: (companies, publish) =>
        new ListConnectionsUseCase(companies, publish),
      inject: [COMPANY_REPOSITORY, PUBLISH_REPOSITORY],
    },
    {
      provide: DisconnectSocialUseCase,
      useFactory: (companies, publish) =>
        new DisconnectSocialUseCase(companies, publish),
      inject: [COMPANY_REPOSITORY, PUBLISH_REPOSITORY],
    },
    {
      provide: ConnectWhatsAppUseCase,
      useFactory: (companies, publish) =>
        new ConnectWhatsAppUseCase(companies, publish),
      inject: [COMPANY_REPOSITORY, PUBLISH_REPOSITORY],
    },
  ],
  exports: [
    QuotaService,
    ListCompaniesUseCase,
    CreateCompanyUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    UploadKnowledgeUseCase,
    ListKnowledgeUseCase,
    DeleteKnowledgeUseCase,
    GenerateContentUseCase,
    ListContentUseCase,
    GetContentUseCase,
    UpdateContentUseCase,
    DuplicateContentUseCase,
    RegenerateContentUseCase,
    ListContentVersionsUseCase,
    RestoreContentVersionUseCase,
    GenerateImageUseCase,
    ListCalendarUseCase,
    ScheduleContentUseCase,
    RescheduleContentUseCase,
    DeleteCalendarEntryUseCase,
    DuplicateCalendarEntryUseCase,
    EnqueuePublishUseCase,
    ListPublishJobsUseCase,
    ListConnectionsUseCase,
    DisconnectSocialUseCase,
    ConnectWhatsAppUseCase,
  ],
})
export class ApplicationModule {}
