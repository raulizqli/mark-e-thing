// apps/api/src/infrastructure/agents/seo.agent.ts

import type {
  AgentContext,
  AgentRecommendation,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';

export class SeoAgent implements MarketingAgent {
  readonly type: AgentType = 'SEO';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const { company, knowledgeTexts } = ctx;
    const baseKeywords: string[] = [];

    if (company.industry) baseKeywords.push(company.industry);
    if (company.city) baseKeywords.push(company.city);
    baseKeywords.push(...company.services.slice(0, 3));
    baseKeywords.push(...company.products.slice(0, 2));

    const knowledgeSample = knowledgeTexts
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 5)
      .slice(0, 5);

    const keywords = [...new Set([...baseKeywords, ...knowledgeSample])].filter(Boolean);

    const insights = [
      `Primary keyword angles: ${keywords.slice(0, 5).join(', ') || 'define industry and location'}.`,
      company.website
        ? `Optimize on-site content for ${company.website}.`
        : 'Add website URL for local SEO signals.',
    ];

    const decisions = [
      'Use 3–5 keywords per blog/post without stuffing.',
      'Include location + service combos in titles.',
    ];

    const recommendations: AgentRecommendation[] = [
      {
        type: 'CREATE_CONTENT',
        title: 'SEO blog post',
        description: `Write a blog targeting: "${keywords.slice(0, 3).join(', ')}".`,
        priority: 6,
        payload: { keywords: keywords.slice(0, 8) },
      },
    ];

    if (company.targetAudience) {
      insights.push(`Audience: ${company.targetAudience}.`);
      recommendations.push({
        type: 'TARGET_AUDIENCE',
        title: 'Audience-focused SEO',
        description: `Create content addressing ${company.targetAudience}.`,
        priority: 5,
        payload: { audience: company.targetAudience },
      });
    }

    return {
      agent: this.type,
      insights,
      decisions,
      data: { keywords },
      recommendations,
    };
  }
}
