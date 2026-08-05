// apps/api/src/application/use-cases/companies/get-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { Company } from '../../../domain/entities/company.entity';
import { AppError } from '../../../shared/errors/app-error';

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
