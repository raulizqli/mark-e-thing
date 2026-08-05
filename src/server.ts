// src/server.ts
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { closeAnalysisQueue } from './modules/jobs/analysis.queue.js';
import { closeDiscoveryQueue } from './modules/jobs/discovery.queue.js';
import { closeEnrichmentQueue } from './modules/jobs/enrichment.queue.js';
import { startWorkers, stopWorkers } from './modules/jobs/workers.js';
import { logger } from './shared/logger/logger.js';
import { prisma } from './shared/prisma/client.js';
import { closeRedisConnection } from './shared/queue/redis.connection.js';

const app = createApp();
let server: Server;

async function start(): Promise<void> {
  startWorkers();

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Server listening');
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutting down gracefully');

  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  await stopWorkers();
  await closeDiscoveryQueue();
  await closeEnrichmentQueue();
  await closeAnalysisQueue();
  await closeRedisConnection();
  await prisma.$disconnect();
  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

start().catch((err: unknown) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
