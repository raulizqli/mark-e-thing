// src/modules/export/export.service.ts
import type { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
import { prisma } from '../../shared/prisma/client.js';
import type { ExportFormat, ExportResult, ExportRow } from './export.types.js';
import { CsvExporter } from './exporters/csv.exporter.js';
import { ExcelExporter } from './exporters/excel.exporter.js';
import type { Exporter } from './exporters/exporter.interface.js';
import { JsonExporter } from './exporters/json.exporter.js';

export class ExportService {
  private readonly exporters: Map<ExportFormat, Exporter>;

  constructor(
    private readonly db: PrismaClient = prisma,
    exporters: Exporter[] = [
      new CsvExporter(),
      new ExcelExporter(),
      new JsonExporter(),
    ],
  ) {
    this.exporters = new Map(exporters.map((exporter) => [exporter.format, exporter]));
  }

  async exportSearch(
    searchId: string,
    userId: string,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const exporter = this.exporters.get(format);
    if (!exporter) {
      throw new ValidationError(`Unsupported export format: ${format}`);
    }

    const search = await this.db.search.findUnique({ where: { id: searchId } });
    if (!search || search.userId !== userId) {
      throw new NotFoundError(`Search ${searchId} not found`);
    }

    const links = await this.db.businessSearch.findMany({
      where: { searchId },
      include: {
        business: {
          include: {
            digitalPresence: true,
            analyses: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const rows: ExportRow[] = links.map((link) => {
      const analysis = link.business.analyses[0] ?? null;
      const presence = link.business.digitalPresence;

      return {
        businessId: link.business.id,
        name: link.business.name,
        address: link.business.formattedAddress,
        website: link.business.websiteUri,
        phone: link.business.nationalPhoneNumber,
        rating: link.business.rating,
        reviewCount: link.business.userRatingCount,
        emails: presence?.emails.join('; ') ?? '',
        technologies: presence?.technologies.join('; ') ?? '',
        sslValid: presence?.sslValid ?? null,
        leadScore: analysis?.leadScore ?? null,
        priority: analysis?.priority ?? null,
        summary: analysis?.summary ?? null,
        opportunities: analysis?.opportunities.join('; ') ?? '',
      };
    });

    return exporter.export(rows, searchId);
  }
}
