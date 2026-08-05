// src/modules/jobs/analysis.worker.spec.ts
import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { AnalysisRepository } from '../analysis/analysis.repository.js';
import type { AnalysisService } from '../analysis/analysis.service.js';
import type { SearchRepository } from '../search/search.repository.js';
import type { AnalysisJobPayload } from '../../shared/queue/queue.registry.js';
import { processAnalysisJob } from './analysis.worker.js';

describe('processAnalysisJob', () => {
  it('marks search completed when all businesses are analyzed', async () => {
    const job = {
      data: { searchId: 'search-1', businessId: 'biz-1' },
    } as Job<AnalysisJobPayload>;

    const analysisService = {
      analyzeBusiness: vi.fn().mockResolvedValue({ businessId: 'biz-1' }),
    } as unknown as AnalysisService;

    const analysisRepository = {
      countBySearchId: vi.fn().mockResolvedValue(2),
      countBusinessesBySearchId: vi.fn().mockResolvedValue(2),
    } as unknown as AnalysisRepository;

    const searchRepository = {
      updateStatus: vi.fn().mockResolvedValue({}),
    } as unknown as SearchRepository;

    await processAnalysisJob(
      job,
      analysisService,
      analysisRepository,
      searchRepository,
    );

    expect(searchRepository.updateStatus).toHaveBeenCalledWith(
      'search-1',
      'COMPLETED',
    );
  });
});
