// apps/api/src/domain/repositories/knowledge.repository.ts

import type {
  CreateKnowledgeDocumentData,
  KnowledgeDocument,
} from '../entities/knowledge-document.entity.js';

export interface KnowledgeRepository {
  create(data: CreateKnowledgeDocumentData): Promise<KnowledgeDocument>;
  findById(id: string): Promise<KnowledgeDocument | null>;
  findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<KnowledgeDocument | null>;
  findAllByCompanyId(companyId: string): Promise<KnowledgeDocument[]>;
  delete(id: string): Promise<void>;
}
