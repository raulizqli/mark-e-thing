// src/modules/export/exporters/json.exporter.ts
import type { ExportResult, ExportRow } from '../export.types.js';
import type { Exporter } from './exporter.interface.js';

export class JsonExporter implements Exporter {
  readonly format = 'json' as const;

  export(rows: ExportRow[], searchId: string): ExportResult {
    return {
      contentType: 'application/json; charset=utf-8',
      filename: `search-${searchId}.json`,
      body: JSON.stringify({ searchId, count: rows.length, rows }, null, 2),
    };
  }
}
