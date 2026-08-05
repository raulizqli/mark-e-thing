// apps/api/src/domain/services/image-generator.port.ts

import type { Company } from '../entities/company.entity.js';

export interface GeneratedImageResult {
  imageBuffer: Buffer;
  mimeType: string;
  model: string;
}

export interface GenerateImageParams {
  company: Company;
  prompt: string;
  contentId?: string;
}

export interface ImageGeneratorPort {
  generate(params: GenerateImageParams): Promise<GeneratedImageResult>;
}
