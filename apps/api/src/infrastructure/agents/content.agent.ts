// apps/api/src/infrastructure/agents/content.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';

export class ContentAgent implements MarketingAgent {
  readonly type: AgentType = 'CONTENT';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const recent = ctx.recentContents;
    const published = recent.filter((c) => c.status === 'PUBLISHED');
    const drafts = recent.filter((c) => c.status === 'DRAFT');
    const scheduled = recent.filter((c) => c.status === 'SCHEDULED');

    const insights = [
      `${recent.length} recent pieces (${published.length} published, ${drafts.length} drafts, ${scheduled.length} scheduled).`,
    ];

    const decisions: string[] = [];
    const recommendations: AgentResult['recommendations'] = [];

    if (drafts.length > 0) {
      decisions.push('Finalize and schedule existing drafts before creating new content.');
      recommendations.push({
        type: 'SCHEDULE',
        title: 'Schedule draft content',
        description: `You have ${drafts.length} draft(s). Schedule "${drafts[0].title}" first.`,
        priority: 8,
        payload: { contentId: drafts[0].id, title: drafts[0].title },
      });
    }

    if (published.length > 0) {
      const top = published[0];
      recommendations.push({
        type: 'RECYCLE',
        title: 'Recycle top content',
        description: `Repurpose "${top.title}" for another platform or format.`,
        priority: 7,
        payload: { contentId: top.id, originalType: top.type },
      });
    }

    const gaps: string[] = [];
    if (!recent.some((c) => c.type.includes('INSTAGRAM'))) gaps.push('Instagram');
    if (!recent.some((c) => c.type.includes('FACEBOOK'))) gaps.push('Facebook');
    if (!recent.some((c) => c.type === 'BLOG')) gaps.push('Blog');

    if (gaps.length) {
      decisions.push(`Fill content gaps: ${gaps.join(', ')}.`);
      recommendations.push({
        type: 'CREATE_CONTENT',
        title: 'Fill platform gaps',
        description: `Create content for: ${gaps.join(', ')}.`,
        priority: 6,
        payload: { platforms: gaps },
      });
    } else {
      decisions.push('Maintain cross-platform coverage.');
    }

    if (ctx.company.services.length) {
      recommendations.push({
        type: 'CREATE_CONTENT',
        title: 'Service spotlight',
        description: `Highlight service: ${ctx.company.services[0]}.`,
        priority: 5,
      });
    }

    return {
      agent: this.type,
      insights,
      decisions,
      data: {
        totalRecent: recent.length,
        published: published.length,
        drafts: drafts.length,
        scheduled: scheduled.length,
        gaps,
      },
      recommendations,
    };
  }
}
