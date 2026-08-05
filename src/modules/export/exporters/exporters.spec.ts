// src/modules/export/exporters/exporters.spec.ts
import { describe, expect, it } from 'vitest';
import type { ExportRow } from '../export.types.js';
import { CsvExporter } from './csv.exporter.js';
import { ExcelExporter } from './excel.exporter.js';
import { JsonExporter } from './json.exporter.js';

const rows: ExportRow[] = [
  {
    businessId: 'biz-1',
    name: 'Cafe, Central',
    address: '1 Main St',
    website: 'https://example.com',
    phone: null,
    rating: 4.5,
    reviewCount: 10,
    emails: 'hello@example.com',
    technologies: 'WordPress',
    sslValid: true,
    leadScore: 82,
    priority: 'HIGH',
    summary: 'Strong opportunity',
    opportunities: 'Website; Ads',
  },
];

describe('exporters', () => {
  it('builds CSV with escaped values', () => {
    const result = new CsvExporter().export(rows, 'search-1');
    expect(result.contentType).toContain('text/csv');
    expect(result.filename).toBe('search-search-1.csv');
    expect(result.body).toContain('"Cafe, Central"');
    expect(result.body).toContain('hello@example.com');
  });

  it('builds JSON payload with row count', () => {
    const result = new JsonExporter().export(rows, 'search-1');
    expect(result.contentType).toContain('application/json');
    const parsed = JSON.parse(String(result.body)) as {
      count: number;
      rows: ExportRow[];
    };
    expect(parsed.count).toBe(1);
    expect(parsed.rows[0].name).toBe('Cafe, Central');
  });

  it('builds a valid XLSX buffer', async () => {
    const result = await new ExcelExporter().export(rows, 'search-1');
    expect(result.contentType).toContain('spreadsheetml');
    expect(result.filename).toBe('search-search-1.xlsx');
    expect(Buffer.isBuffer(result.body)).toBe(true);
    expect((result.body as Buffer).byteLength).toBeGreaterThan(0);
  });
});
