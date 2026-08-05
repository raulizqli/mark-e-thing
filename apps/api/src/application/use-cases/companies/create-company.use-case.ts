// apps/api/src/application/use-cases/companies/create-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import type { CreateCompanyInput } from '../../dto/company.dto.js';

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, input: CreateCompanyInput): Promise<Company> {
    return this.companyRepository.create({
      userId,
      ...input,
    });
  }
}
