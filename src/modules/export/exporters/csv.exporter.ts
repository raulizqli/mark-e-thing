// src/modules/export/exporters/csv.exporter.ts
import type { ExportResult, ExportRow } from '../export.types.js';
import type { Exporter } from './exporter.interface.js';

const HEADERS: Array<keyof ExportRow> = [
  'businessId',
  'name',
  'address',
  'website',
  'phone',
  'rating',
  'reviewCount',
  'emails',
  'technologies',
  'sslValid',
  'leadScore',
  'priority',
  'summary',
  'opportunities',
];

export class CsvExporter implements Exporter {
  readonly format = 'csv' as const;

  export(rows: ExportRow[], searchId: string): ExportResult {
    const lines = [HEADERS.join(',')];

    for (const row of rows) {
      lines.push(HEADERS.map((header) => escapeCsv(row[header])).join(','));
    }

    return {
      contentType: 'text/csv; charset=utf-8',
      filename: `search-${searchId}.csv`,
      body: lines.join('\n'),
    };
  }
}

function escapeCsv(value: ExportRow[keyof ExportRow]): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
