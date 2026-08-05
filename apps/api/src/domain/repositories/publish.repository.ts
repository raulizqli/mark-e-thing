// apps/api/src/domain/repositories/publish.repository.ts

import type {
  CreatePublishJobData,
  PublishJob,
  SocialConnection,
  UpdatePublishJobData,
} from '../entities/publish.entity';
import type { PublishJobStatus, PublishPlatform } from '../types/enums';

export interface PublishJobListFilters {
  status?: PublishJobStatus;
  platform?: PublishPlatform;
  contentId?: string;
}

export interface PublishRepository {
  createJob(data: CreatePublishJobData): Promise<PublishJob>;
  findJobById(id: string): Promise<PublishJob | null>;
  findJobByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<PublishJob | null>;
  findJobsByCompanyId(
    companyId: string,
    filters?: PublishJobListFilters,
  ): Promise<PublishJob[]>;
  updateJob(id: string, data: UpdatePublishJobData): Promise<PublishJob>;
  findConnectionByPlatform(
    companyId: string,
    platform: PublishPlatform,
  ): Promise<SocialConnection | null>;
}
