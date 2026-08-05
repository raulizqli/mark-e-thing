// apps/api/src/application/use-cases/companies/get-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class GetCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, companyId: string): Promise<Company> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    return company;
  }
}
