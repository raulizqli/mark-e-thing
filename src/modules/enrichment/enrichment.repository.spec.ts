// src/modules/enrichment/enrichment.repository.spec.ts
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { EnrichmentRepository } from './enrichment.repository.js';

describe('EnrichmentRepository', () => {
  it('upserts digital presence idempotently by businessId', async () => {
    const upsert = vi.fn().mockResolvedValue({
      id: 'dp-1',
      businessId: 'biz-1',
      emails: ['a@b.com'],
    });
    const db = {
      digitalPresence: { upsert },
    } as unknown as PrismaClient;

    const repository = new EnrichmentRepository(db);
    const payload = {
      businessId: 'biz-1',
      emails: ['a@b.com'],
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
      tiktokUrl: null,
      sslValid: true,
      sslIssuer: 'Issuer',
      loadTimeMs: 100,
      domainExpiry: null,
      technologies: ['WordPress'],
      hasGoogleAnalytics: false,
      hasMetaPixel: false,
      gbpPhotoCount: 0,
      isClaimed: true,
    };

    await repository.upsertDigitalPresence(payload);
    await repository.upsertDigitalPresence(payload);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0][0].where).toEqual({ businessId: 'biz-1' });
  });
});
