// src/modules/jobs/discovery.worker.spec.ts
import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { DiscoveryService } from '../discovery/discovery.service.js';
import type { SearchRepository } from '../search/search.repository.js';
import { processDiscoveryJob } from './discovery.worker.js';
import type { DiscoveryJobPayload } from '../../shared/queue/queue.registry.js';

describe('processDiscoveryJob', () => {
  const payload: DiscoveryJobPayload = {
    searchId: 'search-1',
    category: 'cafe',
    latitude: 19.4,
    longitude: -99.1,
    radiusMeters: 1000,
  };

  it('runs discovery, reports progress, and enqueues enrichment', async () => {
    const updateProgress = vi.fn().mockResolvedValue(undefined);
    const job = {
      data: payload,
      updateProgress,
    } as unknown as Job<DiscoveryJobPayload>;

    const run = vi.fn().mockImplementation(async (_input, onProgress) => {
      await onProgress?.({
        cellsCompleted: 1,
        cellsTotal: 2,
        totalFound: 3,
      });
      return {
        searchId: payload.searchId,
        totalFound: 3,
        businessIds: ['b1', 'b2', 'b3'],
      };
    });

    const searchRepository = {
      updateProgress: vi.fn().mockResolvedValue({}),
      updateStatus: vi.fn().mockResolvedValue({}),
    } as unknown as SearchRepository;

    const enqueueEnrichment = vi.fn().mockResolvedValue(undefined);
    const discoveryService = { run } as unknown as DiscoveryService;

    const result = await processDiscoveryJob(
      job,
      discoveryService,
      searchRepository,
      enqueueEnrichment,
    );

    expect(result).toEqual({
      totalFound: 3,
      businessIds: ['b1', 'b2', 'b3'],
    });
    expect(updateProgress).toHaveBeenCalledWith(50);
    expect(searchRepository.updateProgress).toHaveBeenCalledWith('search-1', {
      totalFound: 3,
    });
    expect(enqueueEnrichment).toHaveBeenCalledWith('search-1', [
      'b1',
      'b2',
      'b3',
    ]);
  });

  it('marks search completed when no businesses are found', async () => {
    const job = {
      data: payload,
      updateProgress: vi.fn(),
    } as unknown as Job<DiscoveryJobPayload>;

    const discoveryService = {
      run: vi.fn().mockResolvedValue({
        searchId: payload.searchId,
        totalFound: 0,
        businessIds: [],
      }),
    } as unknown as DiscoveryService;

    const searchRepository = {
      updateProgress: vi.fn().mockResolvedValue({}),
      updateStatus: vi.fn().mockResolvedValue({}),
    } as unknown as SearchRepository;

    const enqueueEnrichment = vi.fn();

    await processDiscoveryJob(
      job,
      discoveryService,
      searchRepository,
      enqueueEnrichment,
    );

    expect(enqueueEnrichment).not.toHaveBeenCalled();
    expect(searchRepository.updateStatus).toHaveBeenCalledWith(
      'search-1',
      'COMPLETED',
    );
  });

  it('marks search failed when discovery throws', async () => {
    const job = {
      data: payload,
      updateProgress: vi.fn(),
    } as unknown as Job<DiscoveryJobPayload>;

    const discoveryService = {
      run: vi.fn().mockRejectedValue(new Error('places down')),
    } as unknown as DiscoveryService;

    const searchRepository = {
      updateProgress: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue({}),
    } as unknown as SearchRepository;

    await expect(
      processDiscoveryJob(
        job,
        discoveryService,
        searchRepository,
        vi.fn(),
      ),
    ).rejects.toThrow('places down');

    expect(searchRepository.updateStatus).toHaveBeenCalledWith(
      'search-1',
      'FAILED',
    );
  });
});
