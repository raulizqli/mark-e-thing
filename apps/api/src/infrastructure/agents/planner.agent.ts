// apps/api/src/infrastructure/agents/planner.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';
import { monthName } from './agent-utils';

const WEEK_THEMES = [
  'Brand story & values',
  'Product/service spotlight',
  'Social proof & testimonials',
  'Engagement & community',
];

export class PlannerAgent implements MarketingAgent {
  readonly type: AgentType = 'PLANNER';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const now = new Date();
    const month = monthName(now);
    const analytics = ctx.previousSteps.analytics as Record<string, unknown> | undefined;
    const bestHours = (analytics?.bestHours as number[]) ?? [9, 12, 18];

    const weeklyPlan = WEEK_THEMES.map((theme, index) => ({
      week: index + 1,
      theme,
      suggestedPosts: 3 + (index % 2),
      bestHours,
    }));

    const insights = [
      `${month} calendar: ${WEEK_THEMES.length} themed weeks planned.`,
      `Target cadence: 3–4 posts per week.`,
    ];

    const decisions = [
      'Schedule posts during peak engagement hours.',
      'Reserve one slot per week for reactive/trend content.',
    ];

    const recommendations = [
      {
        type: 'MONTHLY_PLAN',
        title: `${month} content calendar`,
        description: `Weekly themes: ${WEEK_THEMES.join(' → ')}.`,
        priority: 9,
        payload: { month, weeklyPlan },
      },
      {
        type: 'SCHEDULE',
        title: 'Batch scheduling',
        description: `Schedule content at ${bestHours.join(', ')}h for optimal reach.`,
        priority: 6,
        payload: { bestHours },
      },
    ];

    return {
      agent: this.type,
      insights,
      decisions,
      data: { month, weeklyPlan, bestHours },
      recommendations,
    };
  }
}
