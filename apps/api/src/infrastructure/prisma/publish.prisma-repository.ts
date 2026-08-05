// apps/api/src/infrastructure/prisma/publish.prisma-repository.ts

import { Injectable } from '@nestjs/common';
import type {
  CreatePublishJobData,
  PublishJob,
  SocialConnection,
  UpdatePublishJobData,
} from '@domain/entities/publish.entity.js';
import type {
  PublishJobListFilters,
  PublishRepository,
} from '@domain/repositories/publish.repository.js';
import type { PublishPlatform } from '@domain/types/enums.js';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class PublishPrismaRepository implements PublishRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(data: CreatePublishJobData): Promise<PublishJob> {
    const row = await this.prisma.publishJob.create({
      data: {
        companyId: data.companyId,
        contentId: data.contentId,
        platform: data.platform,
        status: data.status ?? 'PENDING',
        scheduledAt: data.scheduledAt ?? null,
        publishedAt: data.publishedAt ?? null,
        externalId: data.externalId ?? null,
        error: data.error ?? null,
        payload: data.payload as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapJob(row);
  }

  async findJobById(id: string): Promise<PublishJob | null> {
    const row = await this.prisma.publishJob.findUnique({ where: { id } });
    return row ? this.mapJob(row) : null;
  }

  async findJobByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<PublishJob | null> {
    const row = await this.prisma.publishJob.findFirst({
      where: { id, companyId },
    });
    return row ? this.mapJob(row) : null;
  }

  async findJobsByCompanyId(
    companyId: string,
    filters?: PublishJobListFilters,
  ): Promise<PublishJob[]> {
    const rows = await this.prisma.publishJob.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.platform ? { platform: filters.platform } : {}),
        ...(filters?.contentId ? { contentId: filters.contentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.mapJob(row));
  }

  async updateJob(id: string, data: UpdatePublishJobData): Promise<PublishJob> {
    const row = await this.prisma.publishJob.update({
      where: { id },
      data: {
        ...data,
        payload: data.payload as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapJob(row);
  }

  async findConnectionByPlatform(
    companyId: string,
    platform: PublishPlatform,
  ): Promise<SocialConnection | null> {
    const row = await this.prisma.socialConnection.findUnique({
      where: { companyId_platform: { companyId, platform } },
    });
    return row ? this.mapConnection(row) : null;
  }

  private mapJob(row: {
    id: string;
    companyId: string;
    contentId: string;
    platform: PublishJob['platform'];
    status: PublishJob['status'];
    scheduledAt: Date | null;
    publishedAt: Date | null;
    externalId: string | null;
    error: string | null;
    payload: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): PublishJob {
    return {
      ...row,
      payload: row.payload as Record<string, unknown> | null,
    };
  }

  private mapConnection(row: {
    id: string;
    companyId: string;
    platform: SocialConnection['platform'];
    externalId: string | null;
    displayName: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    metadata: Prisma.JsonValue | null;
    connectedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): SocialConnection {
    return {
      ...row,
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }
}
