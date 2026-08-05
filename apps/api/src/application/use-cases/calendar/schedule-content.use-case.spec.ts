// apps/api/src/application/use-cases/calendar/schedule-content.use-case.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleContentUseCase } from './schedule-content.use-case.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContentRepository } from '../../../domain/repositories/content.repository.js';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import type { Content } from '../../../domain/entities/content.entity.js';
import type { CalendarEntry } from '../../../domain/entities/calendar-entry.entity.js';
import { AppError } from '../../../shared/errors/app-error.js';

const userId = 'user-1';
const companyId = 'company-1';
const contentId = 'content-1';
const scheduledAt = new Date('2026-08-15T10:00:00.000Z');

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

const content: Content = {
  id: contentId,
  companyId,
  type: 'FACEBOOK_POST',
  status: 'DRAFT',
  title: 'Launch post',
  copy: 'We are live!',
  cta: null,
  emojis: [],
  hashtags: [],
  imagePrompt: null,
  seoKeywords: [],
  currentVersion: 1,
  scheduledAt: null,
  publishedAt: null,
  imageId: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const calendarEntry: CalendarEntry = {
  id: 'entry-1',
  companyId,
  contentId,
  scheduledAt,
  notes: 'Morning slot',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ScheduleContentUseCase', () => {
  let companyRepository: CompanyRepository;
  let contentRepository: ContentRepository;
  let calendarRepository: CalendarRepository;
  let useCase: ScheduleContentUseCase;

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
      findByIdForCompany: vi.fn().mockResolvedValue(content),
      findAllByCompanyId: vi.fn(),
      update: vi.fn().mockResolvedValue({
        ...content,
        status: 'SCHEDULED',
        scheduledAt,
      }),
      createVersion: vi.fn(),
      findVersion: vi.fn(),
      findVersionsByContentId: vi.fn(),
    };

    calendarRepository = {
      create: vi.fn().mockResolvedValue(calendarEntry),
      findById: vi.fn(),
      findByIdForCompany: vi.fn(),
      findByCompanyIdInRange: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new ScheduleContentUseCase(
      companyRepository,
      contentRepository,
      calendarRepository,
    );
  });

  it('schedules content and creates a calendar entry', async () => {
    const result = await useCase.execute(userId, {
      companyId,
      contentId,
      scheduledAt,
      notes: 'Morning slot',
    });

    expect(contentRepository.update).toHaveBeenCalledWith(contentId, {
      status: 'SCHEDULED',
      scheduledAt,
    });
    expect(calendarRepository.create).toHaveBeenCalledWith({
      companyId,
      contentId,
      scheduledAt,
      notes: 'Morning slot',
    });
    expect(result).toEqual(calendarEntry);
  });

  it('throws 404 when content is not found', async () => {
    vi.mocked(contentRepository.findByIdForCompany).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, {
        companyId,
        contentId: 'missing',
        scheduledAt,
      }),
    ).rejects.toEqual(AppError.notFound('Content', 'missing'));
  });

  it('throws 404 when company is not found', async () => {
    vi.mocked(companyRepository.findByIdForUser).mockResolvedValue(null);

    await expect(
      useCase.execute(userId, {
        companyId: 'missing',
        contentId,
        scheduledAt,
      }),
    ).rejects.toEqual(AppError.notFound('Company', 'missing'));
  });
});
