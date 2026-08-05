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
} from '@domain/repositories/tokens.js';
import { InfrastructureModule } from '@infrastructure/infrastructure.module.js';
import { CreateCompanyUseCase } from './use-cases/companies/create-company.use-case.js';
import { DeleteCompanyUseCase } from './use-cases/companies/delete-company.use-case.js';
import { GetCompanyUseCase } from './use-cases/companies/get-company.use-case.js';
import { ListCompaniesUseCase } from './use-cases/companies/list-companies.use-case.js';
import { UpdateCompanyUseCase } from './use-cases/companies/update-company.use-case.js';
import { DeleteCalendarEntryUseCase } from './use-cases/calendar/delete-calendar-entry.use-case.js';
import { DuplicateCalendarEntryUseCase } from './use-cases/calendar/duplicate-calendar-entry.use-case.js';
import { ListCalendarUseCase } from './use-cases/calendar/list-calendar.use-case.js';
import { RescheduleContentUseCase } from './use-cases/calendar/reschedule-content.use-case.js';
import { ScheduleContentUseCase } from './use-cases/calendar/schedule-content.use-case.js';
import { DuplicateContentUseCase } from './use-cases/content/duplicate-content.use-case.js';
import { GenerateContentUseCase } from './use-cases/content/generate-content.use-case.js';
import { GetContentUseCase } from './use-cases/content/get-content.use-case.js';
import { ListContentUseCase } from './use-cases/content/list-content.use-case.js';
import { ListContentVersionsUseCase } from './use-cases/content/list-content-versions.use-case.js';
import { RegenerateContentUseCase } from './use-cases/content/regenerate-content.use-case.js';
import { RestoreContentVersionUseCase } from './use-cases/content/restore-content-version.use-case.js';
import { UpdateContentUseCase } from './use-cases/content/update-content.use-case.js';
import { GenerateImageUseCase } from './use-cases/images/generate-image.use-case.js';
import { DeleteKnowledgeUseCase } from './use-cases/knowledge/delete-knowledge.use-case.js';
import { ListKnowledgeUseCase } from './use-cases/knowledge/list-knowledge.use-case.js';
import { UploadKnowledgeUseCase } from './use-cases/knowledge/upload-knowledge.use-case.js';
import { EnqueuePublishUseCase } from './use-cases/publishing/enqueue-publish.use-case.js';
import { ListPublishJobsUseCase } from './use-cases/publishing/list-publish-jobs.use-case.js';

@Module({
  imports: [InfrastructureModule],
  providers: [
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
      useFactory: (companies, knowledge, contents, generator) =>
        new GenerateContentUseCase(companies, knowledge, contents, generator),
      inject: [
        COMPANY_REPOSITORY,
        KNOWLEDGE_REPOSITORY,
        CONTENT_REPOSITORY,
        CONTENT_GENERATOR,
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
      useFactory: (companies, knowledge, contents, generator) =>
        new RegenerateContentUseCase(companies, knowledge, contents, generator),
      inject: [
        COMPANY_REPOSITORY,
        KNOWLEDGE_REPOSITORY,
        CONTENT_REPOSITORY,
        CONTENT_GENERATOR,
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
      useFactory: (companies, contents, images, generator, storage) =>
        new GenerateImageUseCase(companies, contents, images, generator, storage),
      inject: [
        COMPANY_REPOSITORY,
        CONTENT_REPOSITORY,
        IMAGE_REPOSITORY,
        IMAGE_GENERATOR,
        STORAGE_SERVICE,
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
  ],
  exports: [
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
  ],
})
export class ApplicationModule {}
