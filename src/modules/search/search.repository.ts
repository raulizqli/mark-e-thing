// src/modules/search/search.repository.ts
import type { JobStatus, Prisma, PrismaClient, Search } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export class SearchRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(data: Prisma.SearchCreateInput): Promise<Search> {
    return this.db.search.create({ data });
  }

  async findById(id: string): Promise<Search | null> {
    return this.db.search.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: JobStatus): Promise<Search> {
    return this.db.search.update({
      where: { id },
      data: { status },
    });
  }

  async updateProgress(
    id: string,
    data: { status?: JobStatus; totalFound?: number },
  ): Promise<Search> {
    return this.db.search.update({
      where: { id },
      data,
    });
  }
}
