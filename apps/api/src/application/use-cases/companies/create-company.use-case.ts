// apps/api/src/application/use-cases/companies/create-company.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { Company } from '../../../domain/entities/company.entity';
import type { CreateCompanyInput } from '../../dto/company.dto';

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, input: CreateCompanyInput): Promise<Company> {
    return this.companyRepository.create({
      userId,
      ...input,
    });
  }
}
