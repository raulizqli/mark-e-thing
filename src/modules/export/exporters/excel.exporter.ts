// src/modules/export/exporters/excel.exporter.ts
import ExcelJS from 'exceljs';
import type { ExportResult, ExportRow } from '../export.types.js';
import type { Exporter } from './exporter.interface.js';

const COLUMNS: Array<{ header: string; key: keyof ExportRow; width: number }> = [
  { header: 'Business ID', key: 'businessId', width: 36 },
  { header: 'Name', key: 'name', width: 28 },
  { header: 'Address', key: 'address', width: 36 },
  { header: 'Website', key: 'website', width: 28 },
  { header: 'Phone', key: 'phone', width: 18 },
  { header: 'Rating', key: 'rating', width: 10 },
  { header: 'Reviews', key: 'reviewCount', width: 10 },
  { header: 'Emails', key: 'emails', width: 28 },
  { header: 'Technologies', key: 'technologies', width: 24 },
  { header: 'SSL Valid', key: 'sslValid', width: 12 },
  { header: 'Lead Score', key: 'leadScore', width: 12 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Summary', key: 'summary', width: 40 },
  { header: 'Opportunities', key: 'opportunities', width: 40 },
];

export class ExcelExporter implements Exporter {
  readonly format = 'excel' as const;

  async export(rows: ExportRow[], searchId: string): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Prospects');
    sheet.columns = COLUMNS;
    sheet.addRows(rows);

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `search-${searchId}.xlsx`,
      body: Buffer.from(buffer),
    };
  }
}
