// apps/api/src/domain/types/enums.ts

export type ContentType =
  | 'FACEBOOK_POST'
  | 'INSTAGRAM_POST'
  | 'INSTAGRAM_CAROUSEL'
  | 'INSTAGRAM_STORY'
  | 'FACEBOOK_STORY'
  | 'WHATSAPP_STATUS'
  | 'LINKEDIN'
  | 'X'
  | 'BLOG'
  | 'EMAIL'
  | 'PROMOTION';

export type ContentStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'ARCHIVED';

export type KnowledgeType =
  | 'PDF'
  | 'WORD'
  | 'IMAGE'
  | 'CATALOG'
  | 'MANUAL'
  | 'FAQ'
  | 'SUCCESS_CASE'
  | 'OTHER';

export type PublishPlatform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'WHATSAPP'
  | 'LINKEDIN'
  | 'X';

export type PublishJobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'PUBLISHING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';
