// apps/api/src/application/use-cases/companies/delete-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, companyId: string): Promise<void> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    await this.companyRepository.delete(companyId);
  }
}
