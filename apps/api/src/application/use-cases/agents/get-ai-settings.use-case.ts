// apps/api/src/application/use-cases/agents/get-ai-settings.use-case.ts

import type { CompanyAiSettings } from '@domain/entities/agent.entity';
import type { AiSettingsRepository } from '@domain/repositories/ai-settings.repository';
import type { CompanyRepository } from '@domain/repositories/company.repository';
import { AppError } from '@shared/errors/app-error';

export class GetAiSettingsUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly aiSettingsRepository: AiSettingsRepository,
  ) {}

  async execute(userId: string, companyId: string): Promise<CompanyAiSettings | null> {
    const company = await this.companyRepository.findByIdForUser(companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', companyId);
    }

    return this.aiSettingsRepository.findByCompanyId(companyId);
  }
}
