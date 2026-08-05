// apps/api/src/infrastructure/prisma/company.prisma-repository.ts

import { Injectable } from '@nestjs/common';
import type {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
} from '@domain/entities/company.entity.js';
import type { CompanyRepository } from '@domain/repositories/company.repository.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyData): Promise<Company> {
    const row = await this.prisma.company.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        industry: data.industry,
        services: data.services ?? [],
        products: data.products ?? [],
        promotions: data.promotions ?? [],
        city: data.city,
        website: data.website,
        socialFacebook: data.socialFacebook,
        socialInstagram: data.socialInstagram,
        socialLinkedin: data.socialLinkedin,
        socialX: data.socialX,
        socialWhatsapp: data.socialWhatsapp,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        logoUrl: data.logoUrl,
        typography: data.typography,
        targetAudience: data.targetAudience,
        toneOfVoice: data.toneOfVoice,
        forbiddenWords: data.forbiddenWords ?? [],
        preferredCtas: data.preferredCtas ?? [],
      },
    });
    return { ...row };
  }

  async findById(id: string): Promise<Company | null> {
    const row = await this.prisma.company.findUnique({ where: { id } });
    return row ? { ...row } : null;
  }

  async findByIdForUser(id: string, userId: string): Promise<Company | null> {
    const row = await this.prisma.company.findFirst({ where: { id, userId } });
    return row ? { ...row } : null;
  }

  async findAllByUserId(userId: string): Promise<Company[]> {
    const rows = await this.prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({ ...row }));
  }

  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    const row = await this.prisma.company.update({ where: { id }, data });
    return { ...row };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
