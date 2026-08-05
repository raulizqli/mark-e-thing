// apps/api/src/infrastructure/prisma/ai-settings.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  CompanyAiSettings,
  UpsertCompanyAiSettingsData,
} from '@domain/entities/agent.entity';
import type { AiSettingsRepository } from '@domain/repositories/ai-settings.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class AiSettingsPrismaRepository implements AiSettingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByCompanyId(companyId: string): Promise<CompanyAiSettings | null> {
    const row = await this.prisma.companyAiSettings.findUnique({
      where: { companyId },
    });
    return row ? { ...row } : null;
  }

  async upsert(
    companyId: string,
    data: UpsertCompanyAiSettingsData,
  ): Promise<CompanyAiSettings> {
    const row = await this.prisma.companyAiSettings.upsert({
      where: { companyId },
      create: {
        companyId,
        contentProvider: data.contentProvider ?? null,
        contentModel: data.contentModel ?? null,
        imageProvider: data.imageProvider ?? null,
        imageModel: data.imageModel ?? null,
        reasoningProvider: data.reasoningProvider ?? null,
        reasoningModel: data.reasoningModel ?? null,
      },
      update: {
        contentProvider: data.contentProvider,
        contentModel: data.contentModel,
        imageProvider: data.imageProvider,
        imageModel: data.imageModel,
        reasoningProvider: data.reasoningProvider,
        reasoningModel: data.reasoningModel,
      },
    });
    return { ...row };
  }
}
