// apps/api/src/domain/repositories/content.repository.ts

import type { ContentStatus, ContentType } from '../types/enums.js';
import type {
  Content,
  ContentVersion,
  CreateContentData,
  CreateContentVersionData,
  UpdateContentData,
} from '../entities/content.entity.js';

export interface ContentListFilters {
  status?: ContentStatus;
  type?: ContentType;
}

export interface ContentRepository {
  create(data: CreateContentData): Promise<Content>;
  findById(id: string): Promise<Content | null>;
  findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<Content | null>;
  findAllByCompanyId(
    companyId: string,
    filters?: ContentListFilters,
  ): Promise<Content[]>;
  update(id: string, data: UpdateContentData): Promise<Content>;
  createVersion(data: CreateContentVersionData): Promise<ContentVersion>;
  findVersion(
    contentId: string,
    version: number,
  ): Promise<ContentVersion | null>;
  findVersionsByContentId(contentId: string): Promise<ContentVersion[]>;
}
