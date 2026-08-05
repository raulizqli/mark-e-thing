// src/modules/jobs/workers.ts
import type { Worker } from 'bullmq';
import { logger } from '../../shared/logger/logger.js';
import { createAnalysisWorker } from './analysis.worker.js';
import { createDiscoveryWorker } from './discovery.worker.js';
import { createEnrichmentWorker } from './enrichment.worker.js';

const workers: Worker[] = [];

export function startWorkers(): void {
  workers.push(createDiscoveryWorker());
  workers.push(createEnrichmentWorker());
  workers.push(createAnalysisWorker());
  logger.info({ count: workers.length }, 'Background workers started');
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((worker) => worker.close()));
  workers.length = 0;
  logger.info('Background workers stopped');
}
