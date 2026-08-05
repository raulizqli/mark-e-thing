// apps/api/src/infrastructure/prisma/image.prisma-repository.ts

import { Injectable } from '@nestjs/common';
import type {
  CreateGeneratedImageData,
  GeneratedImage,
} from '@domain/entities/generated-image.entity.js';
import type { ImageRepository } from '@domain/repositories/image.repository.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class ImagePrismaRepository implements ImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGeneratedImageData): Promise<GeneratedImage> {
    const row = await this.prisma.generatedImage.create({
      data: {
        companyId: data.companyId,
        prompt: data.prompt,
        storageKey: data.storageKey ?? null,
        url: data.url ?? null,
        model: data.model,
      },
    });
    return { ...row };
  }

  async findById(id: string): Promise<GeneratedImage | null> {
    const row = await this.prisma.generatedImage.findUnique({ where: { id } });
    return row ? { ...row } : null;
  }

  async findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<GeneratedImage | null> {
    const row = await this.prisma.generatedImage.findFirst({
      where: { id, companyId },
    });
    return row ? { ...row } : null;
  }
}
