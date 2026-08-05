// apps/api/src/domain/repositories/ai-settings.repository.ts

import type {
  CompanyAiSettings,
  UpsertCompanyAiSettingsData,
} from '../entities/agent.entity';

export interface AiSettingsRepository {
  findByCompanyId(companyId: string): Promise<CompanyAiSettings | null>;
  upsert(
    companyId: string,
    data: UpsertCompanyAiSettingsData,
  ): Promise<CompanyAiSettings>;
}
