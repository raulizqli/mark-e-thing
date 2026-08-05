// apps/api/src/infrastructure/ai/mock-content.generator.spec.ts

import { describe, expect, it } from 'vitest';
import type { GenerateContentParams } from '@domain/services/content-generator.port.js';
import { MockContentGenerator } from './mock-content.generator.js';

const baseParams: GenerateContentParams = {
  company: {
    id: 'company-1',
    userId: 'user-1',
    name: 'Acme Co',
    description: null,
    industry: 'Retail',
    services: ['Consulting'],
    products: ['Widget'],
    promotions: [],
    city: null,
    website: null,
    socialFacebook: null,
    socialInstagram: null,
    socialLinkedin: null,
    socialX: null,
    socialWhatsapp: null,
    primaryColor: '#3366ff',
    secondaryColor: null,
    accentColor: null,
    logoUrl: null,
    typography: null,
    targetAudience: 'SMB owners',
    toneOfVoice: 'friendly',
    forbiddenWords: [],
    preferredCtas: ['Shop now'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  contentType: 'INSTAGRAM_POST',
  knowledgeTexts: ['We sell widgets.'],
};

describe('MockContentGenerator', () => {
  const generator = new MockContentGenerator();

  it('returns all required fields', async () => {
    const result = await generator.generate(baseParams);

    expect(result.title).toBeTruthy();
    expect(result.copy).toBeTruthy();
    expect(result.cta).toBe('Shop now');
    expect(Array.isArray(result.emojis)).toBe(true);
    expect(result.emojis!.length).toBeGreaterThan(0);
    expect(Array.isArray(result.hashtags)).toBe(true);
    expect(result.hashtags!.length).toBeGreaterThan(0);
    expect(result.imagePrompt).toBeTruthy();
    expect(Array.isArray(result.seoKeywords)).toBe(true);
    expect(result.seoKeywords!.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same input', async () => {
    const a = await generator.generate(baseParams);
    const b = await generator.generate(baseParams);
    expect(a).toEqual(b);
  });
});
