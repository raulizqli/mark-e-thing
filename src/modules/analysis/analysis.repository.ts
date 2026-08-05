// src/modules/analysis/analysis.repository.ts
import type { BusinessAnalysis, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export class AnalysisRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(
    data: Prisma.BusinessAnalysisUncheckedCreateInput,
  ): Promise<BusinessAnalysis> {
    return this.db.businessAnalysis.create({ data });
  }

  async findLatestByBusinessId(
    businessId: string,
  ): Promise<BusinessAnalysis | null> {
    return this.db.businessAnalysis.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countBySearchId(searchId: string): Promise<number> {
    return this.db.businessAnalysis.count({
      where: {
        business: {
          searches: {
            some: { searchId },
          },
        },
      },
    });
  }

  async countBusinessesBySearchId(searchId: string): Promise<number> {
    return this.db.businessSearch.count({
      where: { searchId },
    });
  }
}
