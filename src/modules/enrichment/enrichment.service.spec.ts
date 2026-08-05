// src/modules/enrichment/enrichment.service.spec.ts
import type { Business } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { WebsiteFetcher } from '../../shared/http/website-fetcher.js';
import type { BusinessRepository } from '../business/business.repository.js';
import { EnrichmentService } from './enrichment.service.js';
import type { EnrichmentRepository } from './enrichment.repository.js';
import type { Extractor } from './extractors/extractor.interface.js';

const business: Business = {
  id: 'biz-1',
  googlePlaceId: 'places/1',
  name: 'Cafe',
  formattedAddress: '1 Main',
  websiteUri: 'https://example.com',
  nationalPhoneNumber: null,
  rating: null,
  userRatingCount: null,
  currentOpeningHours: null,
  businessStatus: null,
  latitude: 1,
  longitude: 2,
  googleMapsUri: null,
  primaryType: null,
  types: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EnrichmentService', () => {
  it('aggregates extractor results and upserts digital presence', async () => {
    const businessRepository = {
      findById: vi.fn().mockResolvedValue(business),
    } as unknown as BusinessRepository;

    const upsertDigitalPresence = vi.fn().mockResolvedValue({
      businessId: 'biz-1',
      emails: ['hello@example.com'],
    });
    const enrichmentRepository = {
      upsertDigitalPresence,
    } as unknown as EnrichmentRepository;

    const websiteFetcher = {
      fetch: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: '<a href="mailto:hello@example.com">x</a>',
        loadTimeMs: 100,
        sslValid: true,
        sslIssuer: 'Issuer',
      }),
    } as unknown as WebsiteFetcher;

    const service = new EnrichmentService(
      businessRepository,
      enrichmentRepository,
      websiteFetcher,
    );

    await service.enrichBusiness('biz-1');

    expect(upsertDigitalPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'biz-1',
        emails: ['hello@example.com'],
        sslValid: true,
        sslIssuer: 'Issuer',
        loadTimeMs: 100,
      }),
    );
  });

  it('continues when one extractor fails', async () => {
    const businessRepository = {
      findById: vi.fn().mockResolvedValue(business),
    } as unknown as BusinessRepository;

    const upsertDigitalPresence = vi.fn().mockResolvedValue({
      businessId: 'biz-1',
    });
    const enrichmentRepository = {
      upsertDigitalPresence,
    } as unknown as EnrichmentRepository;

    const websiteFetcher = {
      fetch: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: 'hello@example.com',
        loadTimeMs: 50,
        sslValid: false,
        sslIssuer: null,
      }),
    } as unknown as WebsiteFetcher;

    const failingExtractor: Extractor<never> = {
      name: 'tech-stack',
      extract: () => {
        throw new Error('boom');
      },
    };

    const emailExtractor: Extractor<string[]> = {
      name: 'email',
      extract: () => ['hello@example.com'],
    };

    const service = new EnrichmentService(
      businessRepository,
      enrichmentRepository,
      websiteFetcher,
      [emailExtractor, failingExtractor],
    );

    await service.enrichBusiness('biz-1');

    expect(upsertDigitalPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        emails: ['hello@example.com'],
        technologies: [],
        hasGoogleAnalytics: false,
      }),
    );
  });
});
