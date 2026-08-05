// apps/api/src/application/use-cases/companies/list-companies.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';

export class ListCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string): Promise<Company[]> {
    return this.companyRepository.findAllByUserId(userId);
  }
}
