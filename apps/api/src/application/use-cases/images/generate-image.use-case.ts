// apps/api/src/application/use-cases/images/generate-image.use-case.ts

import { randomUUID } from 'node:crypto';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { ImageRepository } from '../../../domain/repositories/image.repository.js';
import type { ImageGeneratorPort } from '../../../domain/services/image-generator.port.js';
import type { StoragePort } from '../../../domain/services/storage.port.js';
import type { GeneratedImage } from '../../../domain/entities/generated-image.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

export interface GenerateImageInput {
  companyId: string;
  prompt: string;
  contentId?: string;
}

export class GenerateImageUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly imageRepository: ImageRepository,
    private readonly imageGenerator: ImageGeneratorPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(
    userId: string,
    input: GenerateImageInput,
  ): Promise<GeneratedImage> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    if (input.contentId) {
      const content = await this.contentRepository.findByIdForCompany(
        input.contentId,
        input.companyId,
      );
      if (!content) {
        throw AppError.notFound('Content', input.contentId);
      }
    }

    const generated = await this.imageGenerator.generate({
      company,
      prompt: input.prompt,
      contentId: input.contentId,
    });

    const storageKey = `companies/${input.companyId}/images/${randomUUID()}`;
    const stored = await this.storage.upload(
      storageKey,
      generated.imageBuffer,
      generated.mimeType,
    );

    const image = await this.imageRepository.create({
      companyId: input.companyId,
      prompt: input.prompt,
      model: generated.model,
      storageKey: stored.key,
      url: stored.url,
    });

    if (input.contentId) {
      await this.contentRepository.update(input.contentId, {
        imageId: image.id,
      });
    }

    return image;
  }
}
