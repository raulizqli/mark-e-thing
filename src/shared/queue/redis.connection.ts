// src/shared/queue/redis.connection.ts
import type { ConnectionOptions } from 'bullmq';
import { env } from '../../config/env.config.js';

export function getRedisConnection(): ConnectionOptions {
  const url = new URL(env.REDIS_URL);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export async function closeRedisConnection(): Promise<void> {
  // BullMQ owns its connections; queues/workers are closed explicitly.
}
