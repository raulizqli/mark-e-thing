// src/modules/scoring/scoring.engine.spec.ts
import type { Business, DigitalPresence } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { ReviewsRule } from './rules/reviews.rule.js';
import { SslRule } from './rules/ssl.rule.js';
import { TechGapRule } from './rules/tech-gap.rule.js';
import { WebsitePresenceRule } from './rules/website-presence.rule.js';
import { ScoringEngine } from './scoring.engine.js';

const business: Business = {
  id: 'biz-1',
  googlePlaceId: 'places/1',
  name: 'Cafe',
  formattedAddress: '1 Main',
  websiteUri: null,
  nationalPhoneNumber: null,
  rating: null,
  userRatingCount: 0,
  currentOpeningHours: null,
  businessStatus: null,
  latitude: 1,
  longitude: 2,
  googleMapsUri: null,
  primaryType: 'cafe',
  types: ['cafe'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const presence: DigitalPresence = {
  id: 'dp-1',
  businessId: 'biz-1',
  emails: [],
  facebookUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  tiktokUrl: null,
  sslValid: false,
  sslIssuer: null,
  loadTimeMs: 4000,
  domainExpiry: null,
  technologies: [],
  hasGoogleAnalytics: false,
  hasMetaPixel: false,
  gbpPhotoCount: 0,
  isClaimed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('scoring rules', () => {
  it('scores missing website as high opportunity', () => {
    const result = new WebsitePresenceRule().evaluate({
      business,
      digitalPresence: presence,
    });
    expect(result.score).toBe(100);
  });

  it('scores invalid SSL as high opportunity', () => {
    const result = new SslRule().evaluate({
      business: { ...business, websiteUri: 'https://example.com' },
      digitalPresence: presence,
    });
    expect(result.score).toBe(90);
  });

  it('scores zero reviews as high opportunity', () => {
    const result = new ReviewsRule().evaluate({
      business,
      digitalPresence: presence,
    });
    expect(result.score).toBe(100);
  });

  it('scores tech gaps highly', () => {
    const result = new TechGapRule().evaluate({
      business,
      digitalPresence: presence,
    });
    expect(result.score).toBeGreaterThanOrEqual(75);
  });
});

describe('ScoringEngine', () => {
  it('aggregates weighted scores into priority bands', () => {
    const engine = new ScoringEngine();
    const high = engine.score({ business, digitalPresence: presence });
    expect(high.leadScore).toBeGreaterThanOrEqual(75);
    expect(high.priority).toBe('HIGH');
    expect(high.scoringRules).toHaveLength(4);

    const low = engine.score({
      business: {
        ...business,
        websiteUri: 'https://example.com',
        rating: 4.8,
        userRatingCount: 200,
      },
      digitalPresence: {
        ...presence,
        sslValid: true,
        technologies: ['Next.js'],
        hasGoogleAnalytics: true,
        hasMetaPixel: true,
        loadTimeMs: 800,
      },
    });

    expect(low.leadScore).toBeLessThan(45);
    expect(low.priority).toBe('LOW');
  });
});
