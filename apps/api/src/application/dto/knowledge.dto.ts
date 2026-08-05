// apps/api/src/application/dto/knowledge.dto.ts

import type { KnowledgeType } from '../../domain/types/enums';

export interface UploadKnowledgeInput {
  companyId: string;
  title: string;
  type: KnowledgeType;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  extractedText?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListKnowledgeInput {
  companyId: string;
}
