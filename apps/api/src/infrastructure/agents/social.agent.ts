// apps/api/src/infrastructure/agents/social.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';

const PLATFORM_FORMATS: Record<string, string[]> = {
  FACEBOOK: ['FACEBOOK_POST', 'FACEBOOK_STORY'],
  INSTAGRAM: ['INSTAGRAM_POST', 'INSTAGRAM_CAROUSEL', 'INSTAGRAM_STORY'],
  LINKEDIN: ['LINKEDIN'],
  X: ['X'],
  WHATSAPP: ['WHATSAPP_STATUS'],
};

export class SocialAgent implements MarketingAgent {
  readonly type: AgentType = 'SOCIAL';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const { company } = ctx;
    const connected: string[] = [];

    if (company.socialFacebook) connected.push('FACEBOOK');
    if (company.socialInstagram) connected.push('INSTAGRAM');
    if (company.socialLinkedin) connected.push('LINKEDIN');
    if (company.socialX) connected.push('X');
    if (company.socialWhatsapp) connected.push('WHATSAPP');

    const platforms = connected.length ? connected : ['INSTAGRAM', 'FACEBOOK'];
    const formatMap = Object.fromEntries(
      platforms.map((p) => [p, PLATFORM_FORMATS[p] ?? ['FACEBOOK_POST']]),
    );

    const insights = [
      `Active platforms: ${platforms.join(', ')}.`,
      'Match format to platform strengths (carousel for IG, articles for LinkedIn).',
    ];

    const decisions = platforms.map(
      (p) => `Prioritize ${PLATFORM_FORMATS[p]?.[0] ?? 'POST'} on ${p}.`,
    );

    const recommendations = platforms.map((p, i) => ({
      type: 'PUBLISH',
      title: `Publish on ${p}`,
      description: `Create and publish ${PLATFORM_FORMATS[p]?.[0] ?? 'content'} for ${p}.`,
      priority: 7 - i,
      payload: { platform: p, formats: PLATFORM_FORMATS[p] },
    }));

    return {
      agent: this.type,
      insights,
      decisions,
      data: { platforms, formatMap },
      recommendations,
    };
  }
}
