// apps/api/src/infrastructure/agents/trend.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';
import { currentSeason, monthName } from './agent-utils';

const INDUSTRY_HINTS: Record<string, string[]> = {
  retail: ['seasonal sales', 'gift guides', 'limited offers'],
  food: ['menu highlights', 'local ingredients', 'delivery promos'],
  health: ['wellness tips', 'seasonal care', 'community events'],
  tech: ['product updates', 'how-to content', 'case studies'],
  default: ['community stories', 'behind the scenes', 'customer spotlights'],
};

export class TrendAgent implements MarketingAgent {
  readonly type: AgentType = 'TREND';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const now = new Date();
    const industry = (ctx.company.industry ?? 'default').toLowerCase();
    const city = ctx.company.city ?? 'your area';
    const season = currentSeason(now);
    const month = monthName(now);

    const key = Object.keys(INDUSTRY_HINTS).find((k) => industry.includes(k)) ?? 'default';
    const hints = INDUSTRY_HINTS[key];

    const insights = [
      `${month} ${season} trends for ${industry || 'general business'}.`,
      `Local angle: highlight ${city} community and events.`,
      `Trending themes: ${hints.join(', ')}.`,
    ];

    const decisions = [
      `Align weekly themes with ${season} and ${month} events.`,
      'Monitor competitor social activity for format ideas.',
    ];

    const recommendations = [
      {
        type: 'CREATE_CONTENT',
        title: `${month} trend series`,
        description: `Create a 4-post series around: ${hints.slice(0, 2).join(' and ')}.`,
        priority: 6,
        payload: { season, month, themes: hints },
      },
    ];

    return {
      agent: this.type,
      insights,
      decisions,
      data: { season, month, city, themes: hints },
      recommendations,
    };
  }
}
