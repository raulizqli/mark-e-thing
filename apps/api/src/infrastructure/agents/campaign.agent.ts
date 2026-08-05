// apps/api/src/infrastructure/agents/campaign.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';
import { engagementRate, seededInt } from './agent-utils';

export class CampaignAgent implements MarketingAgent {
  readonly type: AgentType = 'CAMPAIGN';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const metrics = ctx.metrics;
    const rate = metrics ? engagementRate(metrics) : 0;
    const budgetMin = seededInt(ctx.company.id + '-budget-min', 50, 150);
    const budgetMax = seededInt(ctx.company.id + '-budget-max', 200, 500);

    const insights: string[] = [];
    const decisions: string[] = [];
    const recommendations: AgentResult['recommendations'] = [];

    if (!metrics || rate < 1.5) {
      insights.push('Campaign performance is weak or unknown.');
      decisions.push('Pause broad paid campaigns; focus on organic testing.');
      recommendations.push({
        type: 'PAUSE_CAMPAIGN',
        title: 'Pause underperforming ads',
        description:
          'Hold paid spend until organic content shows stronger engagement signals.',
        priority: 7,
      });
    } else if (rate >= 4) {
      insights.push('Campaigns show healthy engagement.');
      decisions.push('Repeat top themes with modest budget increase.');
      recommendations.push({
        type: 'REPEAT_CAMPAIGN',
        title: 'Repeat winning campaign',
        description:
          'Re-run the best-performing content themes with lookalike targeting.',
        priority: 8,
        payload: { engagementRate: rate },
      });
    } else {
      insights.push('Campaigns are stable; optimize targeting.');
      decisions.push('A/B test audiences before scaling spend.');
    }

    recommendations.push({
      type: 'AD_BUDGET',
      title: 'Suggested ad budget range',
      description: `Allocate $${budgetMin}–$${budgetMax}/week for paid social tests.`,
      priority: 5,
      payload: { min: budgetMin, max: budgetMax, currency: 'USD' },
    });

    if (ctx.company.promotions.length > 0) {
      insights.push(`Active promotions: ${ctx.company.promotions.join(', ')}.`);
      recommendations.push({
        type: 'CREATE_PROMOTION',
        title: 'Promotion push',
        description: `Feature promotion: ${ctx.company.promotions[0]}.`,
        priority: 6,
      });
    }

    return {
      agent: this.type,
      insights,
      decisions,
      data: { engagementRate: rate, budgetRange: { min: budgetMin, max: budgetMax } },
      recommendations,
    };
  }
}
