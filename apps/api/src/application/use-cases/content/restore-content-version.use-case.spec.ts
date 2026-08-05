// apps/api/src/application/use-cases/content/restore-content-version.use-case.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RestoreContentVersionUseCase } from './restore-content-version.use-case.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import type { Content, ContentVersion } from '../../../domain/entities/content.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

const userId = 'user-1';
const companyId = 'company-1';
const contentId = 'content-1';

const company: Company = {
  id: companyId,
  userId,
  name: 'Acme Co',
  description: null,
  industry: null,
  services: [],
  products: [],
  promotions: [],
  city: null,
  website: null,
  socialFacebook: null,
  socialInstagram: null,
  socialLinkedin: null,
  socialX: null,
  socialWhatsapp: null,
  primaryColor: null,
  secondaryColor: null,
  accentColor: null,
  logoUrl: null,
  typography: null,
  targetAudience: null,
  toneOfVoice: null,
  forbiddenWords: [],
  preferredCtas: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const existingContent: Content = {
  id: contentId,
  companyId,
  type: 'LINKEDIN',
  status: 'DRAFT',
  title: 'Current title',
  copy: 'Current copy',
  cta: null,
  emojis: [],
  hashtags: [],
  imagePrompt: null,
  seoKeywords: [],
  currentVersion: 3,
  scheduledAt: null,
  publishedAt: null,
  imageId: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const versionSnapshot: ContentVersion = {
  id: 'version-1',
  contentId,
  version: 1,
  title: 'Old title',
  copy: 'Old copy',
  cta: 'Learn more',
  emojis: ['✨'],
  hashtags: ['#old'],
  imagePrompt: 'Old prompt',
  seoKeywords: ['widgets'],
  snapshot: null,
  createdAt: new Date(),
};

describe('RestoreContentVersionUseCase', () => {
  let companyRepository: CompanyRepository;
  let contentRepository: ContentRepository;
  let useCase: RestoreContentVersionUseCase;

  beforeEach(() => {
    companyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForUser: vi.fn().mockResolvedValue(company),
      findAllByUserId: vi.fn(),
      update: vi.fn(),
    };

    contentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForCompany: vi.fn().mockResolvedValue(existingContent),
      findAllByCompanyId: vi.fn(),
      update: vi.fn().mockResolvedValue({
        ...existingContent,
        title: versionSnapshot.title,
        copy: versionSnapshot.copy,
        cta: versionSnapshot.cta,
        emojis: versionSnapshot.emojis,
        hashtags: versionSnapshot.hashtags,
        imagePrompt: versionSnapshot.imagePrompt,
        seoKeywords: versionSnapshot.seoKeywords,
        currentVersion: 4,
      }),
      createVersion: vi.fn().mockResolvedValue({}),
      findVersion: vi.fn().mockResolvedValue(versionSnapshot),
      findVersionsByContentId: vi.fn(),
    };

    useCase = new RestoreContentVersionUseCase(
      companyRepository,
      contentRepository,
    );
  });

  it('restores content from a historical version and bumps version', async () => {
    const result = await useCase.execute(userId, companyId, contentId, {
      version: 1,
    });

    expect(contentRepository.findVersion).toHaveBeenCalledWith(contentId, 1);
    expect(contentRepository.update).toHaveBeenCalledWith(
      contentId,
      expect.objectContaining({
        title: 'Old title',
        copy: 'Old copy',
        currentVersion: 4,
      }),
    );
    expect(contentRepository.createVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId,
        version: 4,
        snapshot: { restoredFromVersion: 1 },
      }),
    );
    expect(result.currentVersion).toBe(4);
  });

  it('throws 404 when content is not found', async () => {
    vi.mocked(contentRepository.findByIdForCompany).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, companyId, 'missing', { version: 1 }),
    ).rejects.toEqual(AppError.notFound('Content', 'missing'));
  });

  it('throws 404 when version is not found', async () => {
    vi.mocked(contentRepository.findVersion).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, companyId, contentId, { version: 99 }),
    ).rejects.toEqual(AppError.notFound('ContentVersion', '99'));
  });
});
