// apps/api/src/infrastructure/prisma/recommendation.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateRecommendationData,
  Recommendation,
  UpdateRecommendationData,
} from '@domain/entities/agent.entity';
import type {
  RecommendationListFilters,
  RecommendationRepository,
} from '@domain/repositories/recommendation.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class RecommendationPrismaRepository implements RecommendationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: CreateRecommendationData): Promise<Recommendation> {
    const row = await this.prisma.recommendation.create({
      data: this.toCreateData(data),
    });
    return this.map(row);
  }

  async createMany(data: CreateRecommendationData[]): Promise<Recommendation[]> {
    if (data.length === 0) return [];

    await this.prisma.recommendation.createMany({
      data: data.map((item) => this.toCreateData(item)),
    });

    const runId = data[0].runId;
    if (runId) {
      const rows = await this.prisma.recommendation.findMany({
        where: { runId },
        orderBy: { createdAt: 'desc' },
        take: data.length,
      });
      return rows.map((row) => this.map(row));
    }

    const companyId = data[0].companyId;
    const rows = await this.prisma.recommendation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: data.length,
    });
    return rows.map((row) => this.map(row));
  }

  async findById(id: string): Promise<Recommendation | null> {
    const row = await this.prisma.recommendation.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByIdForCompany(id: string, companyId: string): Promise<Recommendation | null> {
    const row = await this.prisma.recommendation.findFirst({ where: { id, companyId } });
    return row ? this.map(row) : null;
  }

  async findAllByCompanyId(
    companyId: string,
    filters?: RecommendationListFilters,
  ): Promise<Recommendation[]> {
    const rows = await this.prisma.recommendation.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((row) => this.map(row));
  }

  async update(id: string, data: UpdateRecommendationData): Promise<Recommendation> {
    const row = await this.prisma.recommendation.update({
      where: { id },
      data: {
        status: data.status,
        payload: data.payload as Prisma.InputJsonValue | undefined,
      },
    });
    return this.map(row);
  }

  private toCreateData(data: CreateRecommendationData) {
    return {
      companyId: data.companyId,
      runId: data.runId ?? null,
      type: data.type as Prisma.RecommendationCreateInput['type'],
      title: data.title,
      description: data.description,
      priority: data.priority ?? 0,
      payload: data.payload as Prisma.InputJsonValue | undefined,
      status: data.status ?? 'PENDING',
    };
  }

  private map(row: {
    id: string;
    companyId: string;
    runId: string | null;
    type: Recommendation['type'];
    title: string;
    description: string;
    priority: number;
    payload: Prisma.JsonValue;
    status: Recommendation['status'];
    createdAt: Date;
    updatedAt: Date;
  }): Recommendation {
    return {
      id: row.id,
      companyId: row.companyId,
      runId: row.runId,
      type: row.type,
      title: row.title,
      description: row.description,
      priority: row.priority,
      payload: row.payload as Record<string, unknown> | null,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
