// src/modules/export/export.controller.spec.ts
import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { ExportController } from './export.controller.js';
import type { ExportService } from './export.service.js';

describe('ExportController', () => {
  it('sets content headers for export responses', async () => {
    const exportService = {
      exportSearch: vi.fn().mockResolvedValue({
        contentType: 'application/json; charset=utf-8',
        filename: 'search-1.json',
        body: '{"ok":true}',
      }),
    } as unknown as ExportService;

    const controller = new ExportController(exportService);
    const app = express();
    app.use((req, _res, next) => {
      req.auth = {
        userId: '22222222-2222-2222-2222-222222222222',
        email: 'user@example.com',
        role: 'USER',
      };
      next();
    });
    app.get(
      '/searches/:id/export',
      asyncHandler((req, res) => controller.exportSearch(req, res)),
    );

    const response = await request(app)
      .get('/searches/search-1/export')
      .query({ format: 'json' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['content-disposition']).toContain(
      'search-1.json',
    );
    expect(response.text).toContain('"ok":true');
    expect(exportService.exportSearch).toHaveBeenCalledWith(
      'search-1',
      '22222222-2222-2222-2222-222222222222',
      'json',
    );
  });
});
