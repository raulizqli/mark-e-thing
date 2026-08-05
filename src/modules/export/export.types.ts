// src/modules/export/export.types.ts
export interface ExportRow {
  businessId: string;
  name: string;
  address: string;
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  emails: string;
  technologies: string;
  sslValid: boolean | null;
  leadScore: number | null;
  priority: string | null;
  summary: string | null;
  opportunities: string;
}

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportResult {
  contentType: string;
  filename: string;
  body: Buffer | string;
}
