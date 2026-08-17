// apps/api/src/infrastructure/prisma/content.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  Content,
  ContentVersion,
  CreateContentData,
  CreateContentVersionData,
  UpdateContentData,
} from '@domain/entities/content.entity';
import type {
  ContentListFilters,
  ContentRepository,
} from '@domain/repositories/content.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class ContentPrismaRepository implements ContentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: CreateContentData): Promise<Content> {
    const row = await this.prisma.content.create({
      data: {
        companyId: data.companyId,
        type: data.type,
        title: data.title,
        copy: data.copy,
        cta: data.cta ?? null,
        emojis: data.emojis ?? [],
        hashtags: data.hashtags ?? [],
        imagePrompt: data.imagePrompt ?? null,
        seoKeywords: data.seoKeywords ?? [],
        status: data.status ?? 'DRAFT',
        currentVersion: data.currentVersion ?? 1,
        scheduledAt: data.scheduledAt ?? null,
        publishedAt: data.publishedAt ?? null,
        imageId: data.imageId ?? null,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapContent(row);
  }

  async findById(id: string): Promise<Content | null> {
    const row = await this.prisma.content.findUnique({ where: { id } });
    return row ? this.mapContent(row) : null;
  }

  async findByIdForCompany(id: string, companyId: string): Promise<Content | null> {
    const row = await this.prisma.content.findFirst({
      where: { id, companyId },
      include: { image: true },
    });
    return row ? this.mapContent(row) : null;
  }

  async findAllByCompanyId(
    companyId: string,
    filters?: ContentListFilters,
  ): Promise<Content[]> {
    const rows = await this.prisma.content.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.type ? { type: filters.type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.mapContent(row));
  }

  async update(id: string, data: UpdateContentData): Promise<Content> {
    const row = await this.prisma.content.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapContent(row);
  }

  async createVersion(data: CreateContentVersionData): Promise<ContentVersion> {
    const row = await this.prisma.contentVersion.create({
      data: {
        contentId: data.contentId,
        version: data.version,
        title: data.title,
        copy: data.copy,
        cta: data.cta ?? null,
        emojis: data.emojis ?? [],
        hashtags: data.hashtags ?? [],
        imagePrompt: data.imagePrompt ?? null,
        seoKeywords: data.seoKeywords ?? [],
        snapshot: data.snapshot as Prisma.InputJsonValue | undefined,
      },
    });
    return this.mapVersion(row);
  }

  async findVersion(contentId: string, version: number): Promise<ContentVersion | null> {
    const row = await this.prisma.contentVersion.findUnique({
      where: { contentId_version: { contentId, version } },
    });
    return row ? this.mapVersion(row) : null;
  }

  async findVersionsByContentId(contentId: string): Promise<ContentVersion[]> {
    const rows = await this.prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { version: 'desc' },
    });
    return rows.map((row) => this.mapVersion(row));
  }

  private mapContent(row: {
    id: string;
    companyId: string;
    type: Content['type'];
    status: Content['status'];
    title: string;
    copy: string;
    cta: string | null;
    emojis: string[];
    hashtags: string[];
    imagePrompt: string | null;
    seoKeywords: string[];
    currentVersion: number;
    scheduledAt: Date | null;
    publishedAt: Date | null;
    imageId: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    image?: { id: string; url: string | null } | null;
  }): Content {
    return {
      id: row.id,
      companyId: row.companyId,
      type: row.type,
      status: row.status,
      title: row.title,
      copy: row.copy,
      cta: row.cta,
      emojis: row.emojis,
      hashtags: row.hashtags,
      imagePrompt: row.imagePrompt,
      seoKeywords: row.seoKeywords,
      currentVersion: row.currentVersion,
      scheduledAt: row.scheduledAt,
      publishedAt: row.publishedAt,
      imageId: row.imageId,
      image: row.image ? { id: row.image.id, url: row.image.url } : null,
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapVersion(row: {
    id: string;
    contentId: string;
    version: number;
    title: string;
    copy: string;
    cta: string | null;
    emojis: string[];
    hashtags: string[];
    imagePrompt: string | null;
    seoKeywords: string[];
    snapshot: Prisma.JsonValue | null;
    createdAt: Date;
  }): ContentVersion {
    return {
      ...row,
      snapshot: row.snapshot as Record<string, unknown> | null,
    };
  }
}
