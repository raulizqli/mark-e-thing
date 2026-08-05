// apps/api/src/infrastructure/prisma/metrics.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateMetricsSnapshotData,
  MetricsSnapshot,
} from '@domain/entities/agent.entity';
import type { MetricsRepository } from '@domain/repositories/metrics.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class MetricsPrismaRepository implements MetricsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: CreateMetricsSnapshotData): Promise<MetricsSnapshot> {
    const row = await this.prisma.metricsSnapshot.create({
      data: {
        companyId: data.companyId,
        platform: data.platform ?? 'ALL',
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        reach: data.reach ?? 0,
        likes: data.likes ?? 0,
        comments: data.comments ?? 0,
        shares: data.shares ?? 0,
        conversions: data.conversions ?? 0,
        bestHours: data.bestHours as Prisma.InputJsonValue | undefined,
        raw: data.raw as Prisma.InputJsonValue | undefined,
        source: data.source ?? 'mock',
      },
    });
    return this.map(row);
  }

  async findLatestByCompanyId(companyId: string): Promise<MetricsSnapshot | null> {
    const row = await this.prisma.metricsSnapshot.findFirst({
      where: { companyId },
      orderBy: { periodEnd: 'desc' },
    });
    return row ? this.map(row) : null;
  }

  async findRecentByCompanyId(
    companyId: string,
    since: Date,
  ): Promise<MetricsSnapshot | null> {
    const row = await this.prisma.metricsSnapshot.findFirst({
      where: {
        companyId,
        periodEnd: { gte: since },
      },
      orderBy: { periodEnd: 'desc' },
    });
    return row ? this.map(row) : null;
  }

  private map(row: {
    id: string;
    companyId: string;
    platform: string | null;
    periodStart: Date;
    periodEnd: Date;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    conversions: number;
    bestHours: Prisma.JsonValue;
    raw: Prisma.JsonValue;
    source: string;
    createdAt: Date;
  }): MetricsSnapshot {
    return {
      id: row.id,
      companyId: row.companyId,
      platform: row.platform,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      reach: row.reach,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      conversions: row.conversions,
      bestHours: row.bestHours as number[] | null,
      raw: row.raw as Record<string, unknown> | null,
      source: row.source,
      createdAt: row.createdAt,
    };
  }
}
