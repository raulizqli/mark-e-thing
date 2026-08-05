// src/modules/business/business.repository.ts
import type { Business, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export class BusinessRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async upsertByGooglePlaceId(
    data: Prisma.BusinessCreateInput,
  ): Promise<Business> {
    return this.db.business.upsert({
      where: { googlePlaceId: data.googlePlaceId },
      create: data,
      update: {
        name: data.name,
        formattedAddress: data.formattedAddress,
        websiteUri: data.websiteUri,
        nationalPhoneNumber: data.nationalPhoneNumber,
        rating: data.rating,
        userRatingCount: data.userRatingCount,
        currentOpeningHours: data.currentOpeningHours,
        businessStatus: data.businessStatus,
        latitude: data.latitude,
        longitude: data.longitude,
        googleMapsUri: data.googleMapsUri,
        primaryType: data.primaryType,
        types: data.types,
      },
    });
  }

  async linkToSearch(searchId: string, businessId: string): Promise<void> {
    await this.db.businessSearch.upsert({
      where: {
        searchId_businessId: { searchId, businessId },
      },
      create: { searchId, businessId },
      update: {},
    });
  }

  async findById(id: string): Promise<Business | null> {
    return this.db.business.findUnique({ where: { id } });
  }

  async findIdsBySearchId(searchId: string): Promise<string[]> {
    const links = await this.db.businessSearch.findMany({
      where: { searchId },
      select: { businessId: true },
    });
    return links.map((link) => link.businessId);
  }
}
