// apps/api/src/infrastructure/agents/analytics.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';
import { engagementRate } from './agent-utils';

export class AnalyticsAgent implements MarketingAgent {
  readonly type: AgentType = 'ANALYTICS';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const metrics = ctx.metrics;
    const insights: string[] = [];
    const decisions: string[] = [];
    const recommendations: AgentResult['recommendations'] = [];

    if (!metrics) {
      insights.push('No metrics available; using baseline assumptions.');
      decisions.push('Prioritize content consistency until data is collected.');
      return {
        agent: this.type,
        insights,
        decisions,
        data: { hasMetrics: false },
        recommendations,
      };
    }

    const rate = engagementRate(metrics);
    const bestHours = metrics.bestHours ?? [9, 12, 18];

    insights.push(
      `Engagement rate: ${rate.toFixed(2)}% over ${metrics.reach} reach.`,
    );
    insights.push(`Best posting hours: ${bestHours.join(', ')}h.`);
    insights.push(
      `Top signals: ${metrics.likes} likes, ${metrics.comments} comments, ${metrics.shares} shares.`,
    );

    if (rate < 2) {
      decisions.push('Experiment with formats and hooks to lift engagement.');
      recommendations.push({
        type: 'CREATE_CONTENT',
        title: 'Refresh content mix',
        description:
          'Engagement is below 2%. Test carousel posts, stories, and stronger CTAs.',
        priority: 7,
      });
    } else if (rate >= 5) {
      decisions.push('Double down on top-performing formats.');
      recommendations.push({
        type: 'REPEAT_CAMPAIGN',
        title: 'Scale winning content',
        description:
          'Strong engagement detected. Recycle top themes and expand reach.',
        priority: 8,
        payload: { engagementRate: rate },
      });
    } else {
      decisions.push('Maintain cadence and optimize posting times.');
    }

    if (metrics.conversions > 0) {
      insights.push(`${metrics.conversions} conversions in the period.`);
    }

    return {
      agent: this.type,
      insights,
      decisions,
      data: {
        engagementRate: rate,
        bestHours,
        reach: metrics.reach,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        conversions: metrics.conversions,
      },
      recommendations,
    };
  }
}
