// apps/api/src/application/use-cases/companies/list-companies.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { Company } from '../../../domain/entities/company.entity';

export class ListCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string): Promise<Company[]> {
    return this.companyRepository.findAllByUserId(userId);
  }
}
