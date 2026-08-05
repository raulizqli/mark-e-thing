// apps/api/src/domain/services/content-generator.port.ts

import type { Company } from '../entities/company.entity';
import type { ContentType } from '../types/enums';

export interface GeneratedContentResult {
  title: string;
  copy: string;
  cta?: string | null;
  emojis?: string[];
  hashtags?: string[];
  imagePrompt?: string | null;
  seoKeywords?: string[];
}

export interface GenerateContentParams {
  company: Company;
  knowledgeTexts: string[];
  contentType: ContentType;
  topic?: string;
}

export interface ContentGeneratorPort {
  generate(params: GenerateContentParams): Promise<GeneratedContentResult>;
}
