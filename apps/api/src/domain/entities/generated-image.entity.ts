// apps/api/src/domain/entities/generated-image.entity.ts

export interface GeneratedImage {
  id: string;
  companyId: string;
  prompt: string;
  storageKey: string | null;
  url: string | null;
  model: string;
  createdAt: Date;
}

export type CreateGeneratedImageData = Pick<
  GeneratedImage,
  'companyId' | 'prompt' | 'model'
> &
  Partial<Pick<GeneratedImage, 'storageKey' | 'url'>>;
