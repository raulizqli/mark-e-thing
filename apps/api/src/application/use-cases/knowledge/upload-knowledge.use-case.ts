// apps/api/src/application/use-cases/knowledge/upload-knowledge.use-case.ts

import { randomUUID } from 'node:crypto';
import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { StoragePort } from '../../../domain/services/storage.port.js';
import type { KnowledgeDocument } from '../../../domain/entities/knowledge-document.entity.js';
import type { UploadKnowledgeInput } from '../../dto/knowledge.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class UploadKnowledgeUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly storage: StoragePort,
  ) {}

  async execute(
    userId: string,
    input: UploadKnowledgeInput,
  ): Promise<KnowledgeDocument> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const storageKey = `companies/${input.companyId}/knowledge/${randomUUID()}-${input.fileName}`;
    const stored = await this.storage.upload(
      storageKey,
      input.fileBuffer,
      input.mimeType,
    );

    return this.knowledgeRepository.create({
      companyId: input.companyId,
      title: input.title,
      type: input.type,
      fileName: input.fileName,
      mimeType: input.mimeType,
      storageKey: stored.key,
      storageUrl: stored.url,
      extractedText: input.extractedText ?? null,
      metadata: input.metadata ?? null,
    });
  }
}
