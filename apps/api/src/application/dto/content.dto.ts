// apps/api/src/application/dto/content.dto.ts

import type { ContentStatus, ContentType } from '../../domain/types/enums.js';

export interface GenerateContentInput {
  companyId: string;
  type: ContentType;
  topic?: string;
}

export interface UpdateContentInput {
  title?: string;
  copy?: string;
  cta?: string | null;
  emojis?: string[];
  hashtags?: string[];
  imagePrompt?: string | null;
  seoKeywords?: string[];
  status?: ContentStatus;
  imageId?: string | null;
}

export interface RegenerateContentInput {
  topic?: string;
}

export interface DuplicateContentInput {
  title?: string;
}

export interface RestoreContentVersionInput {
  version: number;
}

export interface ListContentInput {
  companyId: string;
  status?: ContentStatus;
  type?: ContentType;
}
