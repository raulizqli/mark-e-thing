// src/modules/business/business.repository.spec.ts
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { BusinessRepository } from './business.repository.js';

describe('BusinessRepository', () => {
  const createInput = {
    googlePlaceId: 'places/abc',
    name: 'Cafe',
    formattedAddress: '1 Main',
    latitude: 1,
    longitude: 2,
    types: ['cafe'],
  };

  it('upserts by googlePlaceId idempotently', async () => {
    const upsert = vi.fn().mockResolvedValue({
      id: 'biz-1',
      ...createInput,
    });
    const db = {
      business: { upsert },
    } as unknown as PrismaClient;

    const repository = new BusinessRepository(db);
    const first = await repository.upsertByGooglePlaceId(createInput);
    const second = await repository.upsertByGooglePlaceId(createInput);

    expect(first.id).toBe('biz-1');
    expect(second.id).toBe('biz-1');
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0][0].where).toEqual({
      googlePlaceId: 'places/abc',
    });
  });

  it('links a business to a search idempotently', async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const db = {
      businessSearch: { upsert },
    } as unknown as PrismaClient;

    const repository = new BusinessRepository(db);
    await repository.linkToSearch('search-1', 'biz-1');
    await repository.linkToSearch('search-1', 'biz-1');

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0][0]).toMatchObject({
      where: {
        searchId_businessId: { searchId: 'search-1', businessId: 'biz-1' },
      },
      create: { searchId: 'search-1', businessId: 'biz-1' },
      update: {},
    });
  });
});
