// src/modules/jobs/discovery.queue.ts
import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  type DiscoveryJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';

let discoveryQueue: Queue<DiscoveryJobPayload> | undefined;

export function getDiscoveryQueue(): Queue<DiscoveryJobPayload> {
  if (!discoveryQueue) {
    discoveryQueue = new Queue<DiscoveryJobPayload>(QUEUE_NAMES.DISCOVERY, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }

  return discoveryQueue;
}

export async function enqueueDiscoveryJob(
  payload: DiscoveryJobPayload,
): Promise<string> {
  const job = await getDiscoveryQueue().add('discover', payload, {
    jobId: `discovery-${payload.searchId}`,
  });
  return job.id ?? payload.searchId;
}

export async function closeDiscoveryQueue(): Promise<void> {
  if (discoveryQueue) {
    await discoveryQueue.close();
    discoveryQueue = undefined;
  }
}
