// src/app.spec.ts
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { AppError } from './shared/errors/app-error.js';
import { asyncHandler } from './shared/http/async-handler.js';
import { errorHandler } from './shared/http/error-handler.middleware.js';

describe('createApp', () => {
  it('returns 200 on /health', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('returns standard envelope for AppError', async () => {
    const app = express();
    app.get(
      '/boom',
      asyncHandler(async () => {
        throw new AppError(422, 'Unprocessable', { field: 'category' });
      }),
    );
    app.use(errorHandler);

    const response = await request(app).get('/boom');

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Unprocessable',
        details: { field: 'category' },
      },
    });
  });

  it('serves the map GUI for unknown GET routes', async () => {
    const app = createApp();
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Prospect Finder');
  });

  it('returns 404 envelope for unknown POST routes', async () => {
    const app = createApp();
    const response = await request(app).post('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: { message: 'Route not found', details: null },
    });
  });
});
