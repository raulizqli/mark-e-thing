// apps/api/src/infrastructure/agents/orchestrator.service.spec.ts

import { describe, it, expect } from 'vitest';
import type { Company } from '@domain/entities/company.entity';
import type { MetricsSnapshot } from '@domain/entities/agent.entity';
import { MarketingOrchestratorService } from './orchestrator.service';

const company: Company = {
  id: 'company-1',
  userId: 'user-1',
  name: 'Acme Bakery',
  description: 'Artisan breads and pastries',
  industry: 'food',
  services: ['catering', 'delivery'],
  products: ['sourdough', 'croissants'],
  promotions: ['10% off Mondays'],
  city: 'Austin',
  website: 'https://acme.example',
  socialFacebook: 'acme',
  socialInstagram: 'acme',
  socialLinkedin: null,
  socialX: null,
  socialWhatsapp: null,
  primaryColor: '#8B4513',
  secondaryColor: '#F5DEB3',
  accentColor: '#D2691E',
  logoUrl: null,
  typography: 'serif',
  targetAudience: 'local food lovers',
  toneOfVoice: 'warm and inviting',
  forbiddenWords: ['cheap'],
  preferredCtas: ['Order now', 'Visit us'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const metrics: MetricsSnapshot = {
  id: 'metrics-1',
  companyId: company.id,
  platform: 'ALL',
  periodStart: new Date('2026-07-01'),
  periodEnd: new Date('2026-07-31'),
  reach: 2500,
  likes: 180,
  comments: 24,
  shares: 12,
  conversions: 8,
  bestHours: [9, 12, 18],
  raw: null,
  source: 'mock',
  createdAt: new Date(),
};

describe('MarketingOrchestratorService', () => {
  it('runs all agent steps and produces recommendations', async () => {
    const orchestrator = new MarketingOrchestratorService();

    const output = await orchestrator.run({
      companyId: company.id,
      company,
      knowledgeTexts: ['We use organic flour.'],
      recentContents: [],
      metrics,
      goal: 'monthly_plan',
    });

    expect(output.steps.length).toBe(9);
    expect(output.steps.every((s) => s.status === 'COMPLETED')).toBe(true);
    expect(output.recommendations.length).toBeGreaterThan(0);
    expect(output.summary).toContain('Acme Bakery');
    expect(output.plan).toHaveProperty('weeklyPlan');
    expect(output.plan).toHaveProperty('agentOutputs');
  });
});
