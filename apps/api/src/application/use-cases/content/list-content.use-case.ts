// apps/api/src/application/use-cases/content/list-content.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { Content } from '../../../domain/entities/content.entity';
import type { ListContentInput } from '../../dto/content.dto';
import { AppError } from '../../../shared/errors/app-error';

export class ListContentUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
  ) {}

  async execute(userId: string, input: ListContentInput): Promise<Content[]> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    return this.contentRepository.findAllByCompanyId(input.companyId, {
      status: input.status,
      type: input.type,
    });
  }
}
