// apps/api/src/infrastructure/prisma/publish.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  CreatePublishJobData,
  PublishJob,
  SocialConnection,
  UpdatePublishJobData,
} from '@domain/entities/publish.entity';
import type {
  PublishJobListFilters,
  PublishRepository,
} from '@domain/repositories/publish.repository';
import type { PublishPlatform } from '@domain/types/enums';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PublishPrismaRepository implements PublishRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async listConnections(companyId: string): Promise<SocialConnection[]> {
    const rows = await this.prisma.socialConnection.findMany({
      where: { companyId },
      orderBy: { platform: 'asc' },
    });
    return rows.map((row) => this.mapConnection(row));
  }

  async upsertConnection(data: {
    companyId: string;
    platform: PublishPlatform;
    externalId?: string | null;
    displayName?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    metadata?: Record<string, unknown> | null;
    connectedAt?: Date | null;
  }): Promise<SocialConnection> {
    const row = await this.prisma.socialConnection.upsert({
      where: {
        companyId_platform: {
          companyId: data.companyId,
          platform: data.platform,
        },
      },
      create: {
        companyId: data.companyId,
        platform: data.platform,
        externalId: data.externalId ?? null,
        displayName: data.displayName ?? null,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        connectedAt: data.connectedAt ?? new Date(),
      },
      update: {
        externalId: data.externalId ?? undefined,
        displayName: data.displayName ?? undefined,
        accessToken: data.accessToken ?? undefined,
        refreshToken: data.refreshToken ?? undefined,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        connectedAt: data.connectedAt ?? new Date(),
      },
    });
    return this.mapConnection(row);
  }

  async deleteConnection(
    companyId: string,
    platform: PublishPlatform,
  ): Promise<void> {
    await this.prisma.socialConnection.delete({
      where: { companyId_platform: { companyId, platform } },
    });
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
