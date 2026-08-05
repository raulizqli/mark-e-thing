// apps/api/src/application/use-cases/content/generate-content.use-case.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateContentUseCase } from './generate-content.use-case.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { KnowledgeRepository } from '../../../domain/repositories/knowledge.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { ContentGeneratorPort } from '../../../domain/services/content-generator.port.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import type { KnowledgeDocument } from '../../../domain/entities/knowledge-document.entity.js';
import type { Content } from '../../../domain/entities/content.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

const userId = 'user-1';
const companyId = 'company-1';

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

const knowledgeDoc: KnowledgeDocument = {
  id: 'doc-1',
  companyId,
  title: 'Brand Guide',
  type: 'MANUAL',
  fileName: 'guide.pdf',
  mimeType: 'application/pdf',
  storageKey: 'key',
  storageUrl: null,
  extractedText: 'We sell widgets.',
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createdContent: Content = {
  id: 'content-1',
  companyId,
  type: 'INSTAGRAM_POST',
  status: 'DRAFT',
  title: 'Generated Title',
  copy: 'Generated copy',
  cta: 'Shop now',
  emojis: ['🚀'],
  hashtags: ['#acme'],
  imagePrompt: 'A widget on a desk',
  seoKeywords: [],
  currentVersion: 1,
  scheduledAt: null,
  publishedAt: null,
  imageId: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GenerateContentUseCase', () => {
  let companyRepository: CompanyRepository;
  let knowledgeRepository: KnowledgeRepository;
  let contentRepository: ContentRepository;
  let contentGenerator: ContentGeneratorPort;
  let useCase: GenerateContentUseCase;

  beforeEach(() => {
    companyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForUser: vi.fn().mockResolvedValue(company),
      findAllByUserId: vi.fn(),
      update: vi.fn(),
    };

    knowledgeRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn().mockResolvedValue([knowledgeDoc]),
      delete: vi.fn(),
    };

    contentRepository = {
      create: vi.fn().mockResolvedValue(createdContent),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findAllByCompanyId: vi.fn(),
      update: vi.fn(),
      createVersion: vi.fn().mockResolvedValue({}),
      findVersion: vi.fn(),
      findVersionsByContentId: vi.fn(),
    };

    contentGenerator = {
      generate: vi.fn().mockResolvedValue({
        title: 'Generated Title',
        copy: 'Generated copy',
        cta: 'Shop now',
        emojis: ['🚀'],
        hashtags: ['#acme'],
        imagePrompt: 'A widget on a desk',
      }),
    };

    useCase = new GenerateContentUseCase(
      companyRepository,
      knowledgeRepository,
      contentRepository,
      contentGenerator,
    );
  });

  it('generates content using company and knowledge context', async () => {
    const result = await useCase.execute(userId, {
      companyId,
      type: 'INSTAGRAM_POST',
      topic: 'Summer sale',
    });

    expect(contentGenerator.generate).toHaveBeenCalledWith({
      company,
      knowledgeTexts: ['We sell widgets.'],
      contentType: 'INSTAGRAM_POST',
      topic: 'Summer sale',
    });
    expect(contentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId,
        type: 'INSTAGRAM_POST',
        status: 'DRAFT',
        title: 'Generated Title',
        currentVersion: 1,
      }),
    );
    expect(contentRepository.createVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: 'content-1',
        version: 1,
      }),
    );
    expect(result).toEqual(createdContent);
  });

  it('throws 404 when company is not found', async () => {
    vi.mocked(companyRepository.findByIdForUser).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, {
        companyId: 'missing',
        type: 'BLOG',
      }),
    ).rejects.toEqual(AppError.notFound('Company', 'missing'));
  });
});
