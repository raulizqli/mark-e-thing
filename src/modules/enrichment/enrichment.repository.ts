// src/modules/enrichment/enrichment.repository.ts
import type { DigitalPresence, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export type DigitalPresenceUpsertInput = Omit<
  Prisma.DigitalPresenceUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>;

export class EnrichmentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async upsertDigitalPresence(
    data: DigitalPresenceUpsertInput,
  ): Promise<DigitalPresence> {
    return this.db.digitalPresence.upsert({
      where: { businessId: data.businessId },
      create: data,
      update: {
        emails: data.emails,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        linkedinUrl: data.linkedinUrl,
        tiktokUrl: data.tiktokUrl,
        sslValid: data.sslValid,
        sslIssuer: data.sslIssuer,
        loadTimeMs: data.loadTimeMs,
        domainExpiry: data.domainExpiry,
        technologies: data.technologies,
        hasGoogleAnalytics: data.hasGoogleAnalytics,
        hasMetaPixel: data.hasMetaPixel,
        gbpPhotoCount: data.gbpPhotoCount,
        isClaimed: data.isClaimed,
      },
    });
  }
}
