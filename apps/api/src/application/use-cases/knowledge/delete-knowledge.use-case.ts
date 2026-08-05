// apps/api/src/application/use-cases/knowledge/delete-knowledge.use-case.ts

import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository';
import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { StoragePort } from '../../../domain/services/storage.port';
import { AppError } from '../../../shared/errors/app-error';

export class DeleteKnowledgeUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly storage: StoragePort,
  ) {}

  async execute(
    userId: string,
    companyId: string,
    documentId: string,
  ): Promise<void> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    const document = await this.knowledgeRepository.findByIdForCompany(
      documentId,
      companyId,
    );
    if (!document) {
      throw AppError.notFound('KnowledgeDocument', documentId);
    }

    await this.storage.delete(document.storageKey);
    await this.knowledgeRepository.delete(documentId);
  }
}
