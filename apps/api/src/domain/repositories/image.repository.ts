// apps/api/src/domain/repositories/image.repository.ts

import type {
  CreateGeneratedImageData,
  GeneratedImage,
} from '../entities/generated-image.entity.js';

export interface ImageRepository {
  create(data: CreateGeneratedImageData): Promise<GeneratedImage>;
  findById(id: string): Promise<GeneratedImage | null>;
  findByIdForCompany(
    id: string,
    companyId: string,
  ): Promise<GeneratedImage | null>;
}
