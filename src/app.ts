// src/app.ts
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.config.js';
import { createApiRouter } from './routes/index.js';
import { errorHandler } from './shared/http/error-handler.middleware.js';
import { notFoundHandler } from './shared/http/not-found.middleware.js';
import { logger } from './shared/logger/logger.js';

const publicPath = join(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
  'public',
);

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy:
        env.NODE_ENV === 'test'
          ? false
          : {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                imgSrc: [
                  "'self'",
                  'data:',
                  'https://*.tile.openstreetmap.org',
                  'https://unpkg.com',
                ],
                connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
                frameSrc: ["'self'", 'https://*.supabase.co'],
              },
            },
    }),
  );
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({
      logger: logger as never,
      autoLogging: env.NODE_ENV !== 'test',
    }),
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(createApiRouter());
  app.use(express.static(publicPath));

  app.get(/^(?!\/(searches|health|ready)).*$/, (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }
    res.sendFile(join(publicPath, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
