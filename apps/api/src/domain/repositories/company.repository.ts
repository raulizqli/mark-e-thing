// apps/api/src/domain/repositories/company.repository.ts

import type {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
} from '../entities/company.entity.js';

export interface CompanyRepository {
  create(data: CreateCompanyData): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByIdForUser(id: string, userId: string): Promise<Company | null>;
  findAllByUserId(userId: string): Promise<Company[]>;
  update(id: string, data: UpdateCompanyData): Promise<Company>;
}
