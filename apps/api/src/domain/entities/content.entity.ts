// apps/api/src/domain/entities/content.entity.ts

import type { ContentStatus, ContentType } from '../types/enums';

export interface Content {
  id: string;
  companyId: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  copy: string;
  cta: string | null;
  emojis: string[];
  hashtags: string[];
  imagePrompt: string | null;
  seoKeywords: string[];
  currentVersion: number;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  imageId: string | null;
  image?: { id: string; url: string | null } | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  copy: string;
  cta: string | null;
  emojis: string[];
  hashtags: string[];
  imagePrompt: string | null;
  seoKeywords: string[];
  snapshot: Record<string, unknown> | null;
  createdAt: Date;
}

export type CreateContentData = Pick<
  Content,
  'companyId' | 'type' | 'title' | 'copy'
> &
  Partial<
    Omit<
      Content,
      'id' | 'companyId' | 'type' | 'title' | 'copy' | 'createdAt' | 'updatedAt'
    >
  >;

export type UpdateContentData = Partial<
  Pick<
    Content,
    | 'title'
    | 'copy'
    | 'cta'
    | 'emojis'
    | 'hashtags'
    | 'imagePrompt'
    | 'seoKeywords'
    | 'status'
    | 'scheduledAt'
    | 'publishedAt'
    | 'imageId'
    | 'metadata'
    | 'currentVersion'
  >
>;

export type CreateContentVersionData = Pick<
  ContentVersion,
  | 'contentId'
  | 'version'
  | 'title'
  | 'copy'
> &
  Partial<
    Pick<
      ContentVersion,
      'cta' | 'emojis' | 'hashtags' | 'imagePrompt' | 'seoKeywords' | 'snapshot'
    >
  >;
