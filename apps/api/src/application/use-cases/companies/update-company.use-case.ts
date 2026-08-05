// apps/api/src/application/use-cases/companies/update-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import type { UpdateCompanyInput } from '../../dto/company.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(
    userId: string,
    companyId: string,
    input: UpdateCompanyInput,
  ): Promise<Company> {
    const company = await this.companyRepository.findByIdForUser(
      companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    return this.companyRepository.update(companyId, input);
  }
}
