// apps/api/src/domain/entities/publish.entity.ts

import type { PublishJobStatus, PublishPlatform } from '../types/enums.js';

export interface SocialConnection {
  id: string;
  companyId: string;
  platform: PublishPlatform;
  externalId: string | null;
  displayName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  metadata: Record<string, unknown> | null;
  connectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublishJob {
  id: string;
  companyId: string;
  contentId: string;
  platform: PublishPlatform;
  status: PublishJobStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  externalId: string | null;
  error: string | null;
  payload: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePublishJobData = Pick<
  PublishJob,
  'companyId' | 'contentId' | 'platform'
> &
  Partial<
    Pick<
      PublishJob,
      'status' | 'scheduledAt' | 'publishedAt' | 'externalId' | 'error' | 'payload'
    >
  >;

export type UpdatePublishJobData = Partial<
  Pick<
    PublishJob,
    | 'status'
    | 'scheduledAt'
    | 'publishedAt'
    | 'externalId'
    | 'error'
    | 'payload'
  >
>;
