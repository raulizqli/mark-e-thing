// src/modules/export/exporters/exporter.interface.ts
import type { ExportResult, ExportRow } from '../export.types.js';

export interface Exporter {
  readonly format: 'csv' | 'excel' | 'json';
  export(rows: ExportRow[], searchId: string): Promise<ExportResult> | ExportResult;
}
