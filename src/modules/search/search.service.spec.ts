// src/modules/search/search.service.spec.ts
import type { Search } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { SearchRepository } from './search.repository.js';
import { SearchService } from './search.service.js';

const baseSearch: Search = {
  id: '11111111-1111-1111-1111-111111111111',
  userId: '22222222-2222-2222-2222-222222222222',
  category: 'cafe',
  city: null,
  neighborhood: null,
  postalCode: null,
  latitude: 19.4,
  longitude: -99.1,
  radius: 2000,
  status: 'PENDING',
  totalFound: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SearchService', () => {
  it('creates a search for the authenticated user and enqueues discovery', async () => {
    const create = vi.fn().mockResolvedValue(baseSearch);
    const enqueueDiscovery = vi.fn().mockResolvedValue('job-1');
    const repository = { create } as unknown as SearchRepository;

    const service = new SearchService(repository, enqueueDiscovery);
    const result = await service.createSearch(baseSearch.userId, {
      category: 'cafe',
      latitude: 19.4,
      longitude: -99.1,
      radiusMeters: 2000,
    });

    expect(result.id).toBe(baseSearch.id);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { connect: { id: baseSearch.userId } },
      }),
    );
    expect(enqueueDiscovery).toHaveBeenCalledWith({
      searchId: baseSearch.id,
      category: 'cafe',
      latitude: 19.4,
      longitude: -99.1,
      radiusMeters: 2000,
    });
  });

  it('returns status progress for an owned search', async () => {
    const findById = vi.fn().mockResolvedValue({
      ...baseSearch,
      status: 'PROCESSING',
      totalFound: 4,
    });
    const repository = { findById } as unknown as SearchRepository;
    const service = new SearchService(repository);

    await expect(
      service.getStatus(baseSearch.id, baseSearch.userId),
    ).resolves.toEqual({
      id: baseSearch.id,
      status: 'PROCESSING',
      totalFound: 4,
      progress: 50,
    });
  });

  it('throws NotFoundError for missing or unowned searches', async () => {
    const findById = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...baseSearch,
        userId: 'other-user',
      });
    const repository = { findById } as unknown as SearchRepository;
    const service = new SearchService(repository);

    await expect(
      service.getSearch('missing', baseSearch.userId),
    ).rejects.toBeInstanceOf(NotFoundError);

    await expect(
      service.getSearch(baseSearch.id, baseSearch.userId),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
