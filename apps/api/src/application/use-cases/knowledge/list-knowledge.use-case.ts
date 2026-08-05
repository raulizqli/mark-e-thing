// apps/api/src/application/use-cases/knowledge/list-knowledge.use-case.ts

import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository';
import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { KnowledgeDocument } from '../../../domain/entities/knowledge-document.entity';
import type { ListKnowledgeInput } from '../../dto/knowledge.dto';
import { AppError } from '../../../shared/errors/app-error';

export class ListKnowledgeUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
  ) {}

  async execute(
    userId: string,
    input: ListKnowledgeInput,
  ): Promise<KnowledgeDocument[]> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    return this.knowledgeRepository.findAllByCompanyId(input.companyId);
  }
}
