// apps/api/src/domain/entities/knowledge-document.entity.ts

import type { KnowledgeType } from '../types/enums';

export interface KnowledgeDocument {
  id: string;
  companyId: string;
  title: string;
  type: KnowledgeType;
  fileName: string;
  mimeType: string;
  storageKey: string;
  storageUrl: string | null;
  extractedText: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateKnowledgeDocumentData = Pick<
  KnowledgeDocument,
  | 'companyId'
  | 'title'
  | 'type'
  | 'fileName'
  | 'mimeType'
  | 'storageKey'
> &
  Partial<
    Pick<KnowledgeDocument, 'storageUrl' | 'extractedText' | 'metadata'>
  >;
