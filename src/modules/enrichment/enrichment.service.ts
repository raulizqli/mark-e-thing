// src/modules/enrichment/enrichment.service.ts
import type { DigitalPresence } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { logger } from '../../shared/logger/logger.js';
import { WebsiteFetcher } from '../../shared/http/website-fetcher.js';
import { BusinessRepository } from '../business/business.repository.js';
import {
  EnrichmentRepository,
  type DigitalPresenceUpsertInput,
} from './enrichment.repository.js';
import type { Extractor, ExtractorInput } from './extractors/extractor.interface.js';
import { EmailExtractor } from './extractors/email.extractor.js';
import { SocialMediaExtractor } from './extractors/social-media.extractor.js';
import { SslPerformanceExtractor } from './extractors/ssl-performance.extractor.js';
import { TechStackExtractor } from './extractors/tech-stack.extractor.js';

export class EnrichmentService {
  private readonly extractors: Extractor<unknown>[];

  constructor(
    private readonly businessRepository: BusinessRepository = new BusinessRepository(),
    private readonly enrichmentRepository: EnrichmentRepository = new EnrichmentRepository(),
    private readonly websiteFetcher: WebsiteFetcher = new WebsiteFetcher(),
    extractors?: Extractor<unknown>[],
  ) {
    this.extractors =
      extractors ??
      [
        new EmailExtractor(),
        new TechStackExtractor(),
        new SslPerformanceExtractor(),
        new SocialMediaExtractor(),
      ];
  }

  async enrichBusiness(businessId: string): Promise<DigitalPresence> {
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError(`Business ${businessId} not found`);
    }

    const baseInput = await this.buildExtractorInput(business.websiteUri);
    const partials = await this.runExtractors(baseInput);
    const payload = this.aggregate(businessId, partials);

    return this.enrichmentRepository.upsertDigitalPresence(payload);
  }

  private async buildExtractorInput(
    websiteUri: string | null,
  ): Promise<ExtractorInput> {
    if (!websiteUri) {
      return {
        websiteUri: null,
        html: '',
        loadTimeMs: null,
        sslValid: false,
        sslIssuer: null,
      };
    }

    try {
      const fetched = await this.websiteFetcher.fetch(websiteUri);
      return {
        websiteUri: fetched.url,
        html: fetched.html,
        loadTimeMs: fetched.loadTimeMs,
        sslValid: fetched.sslValid,
        sslIssuer: fetched.sslIssuer,
      };
    } catch (err) {
      logger.warn({ err, websiteUri }, 'Website fetch failed during enrichment');
      return {
        websiteUri,
        html: '',
        loadTimeMs: null,
        sslValid: false,
        sslIssuer: null,
      };
    }
  }

  private async runExtractors(
    input: ExtractorInput,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    await Promise.all(
      this.extractors.map(async (extractor) => {
        try {
          results[extractor.name] = await extractor.extract(input);
        } catch (err) {
          logger.warn(
            { err, extractor: extractor.name },
            'Extractor failed; continuing with partial enrichment',
          );
        }
      }),
    );

    return results;
  }

  private aggregate(
    businessId: string,
    partials: Record<string, unknown>,
  ): DigitalPresenceUpsertInput {
    const emails = (partials.email as string[] | undefined) ?? [];
    const tech = partials['tech-stack'] as
      | {
          technologies: string[];
          hasGoogleAnalytics: boolean;
          hasMetaPixel: boolean;
        }
      | undefined;
    const ssl = partials['ssl-performance'] as
      | {
          sslValid: boolean;
          sslIssuer: string | null;
          loadTimeMs: number | null;
        }
      | undefined;
    const social = partials['social-media'] as
      | {
          facebookUrl: string | null;
          instagramUrl: string | null;
          linkedinUrl: string | null;
          tiktokUrl: string | null;
        }
      | undefined;

    return {
      businessId,
      emails,
      facebookUrl: social?.facebookUrl ?? null,
      instagramUrl: social?.instagramUrl ?? null,
      linkedinUrl: social?.linkedinUrl ?? null,
      tiktokUrl: social?.tiktokUrl ?? null,
      sslValid: ssl?.sslValid ?? false,
      sslIssuer: ssl?.sslIssuer ?? null,
      loadTimeMs: ssl?.loadTimeMs ?? null,
      domainExpiry: null,
      technologies: tech?.technologies ?? [],
      hasGoogleAnalytics: tech?.hasGoogleAnalytics ?? false,
      hasMetaPixel: tech?.hasMetaPixel ?? false,
      gbpPhotoCount: 0,
      isClaimed: true,
    };
  }
}
