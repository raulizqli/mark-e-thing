// apps/api/src/infrastructure/prisma/knowledge.prisma-repository.ts

import { Injectable } from '@nestjs/common';
import type {
  CreateKnowledgeDocumentData,
  KnowledgeDocument,
} from '@domain/entities/knowledge-document.entity.js';
import type { KnowledgeRepository } from '@domain/repositories/knowledge.repository.js';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class KnowledgePrismaRepository implements KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateKnowledgeDocumentData): Promise<KnowledgeDocument> {
    const row = await this.prisma.knowledgeDocument.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        type: data.type,
        fileName: data.fileName,
        mimeType: data.mimeType,
        storageKey: data.storageKey,
        storageUrl: data.storageUrl ?? null,
        extractedText: data.extractedText ?? null,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return this.map(row);
  }

  async findById(id: string): Promise<KnowledgeDocument | null> {
    const row = await this.prisma.knowledgeDocument.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<KnowledgeDocument | null> {
    const row = await this.prisma.knowledgeDocument.findFirst({
      where: { id, companyId },
    });
    return row ? this.map(row) : null;
  }

  async findAllByCompanyId(companyId: string): Promise<KnowledgeDocument[]> {
    const rows = await this.prisma.knowledgeDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.map(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.knowledgeDocument.delete({ where: { id } });
  }

  private map(row: {
    id: string;
    companyId: string;
    title: string;
    type: KnowledgeDocument['type'];
    fileName: string;
    mimeType: string;
    storageKey: string;
    storageUrl: string | null;
    extractedText: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): KnowledgeDocument {
    return {
      ...row,
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }
}
