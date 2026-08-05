// apps/api/src/infrastructure/agents/brand.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';

export class BrandAgent implements MarketingAgent {
  readonly type: AgentType = 'BRAND';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const { company } = ctx;
    const tone = company.toneOfVoice ?? 'professional and friendly';
    const forbidden = company.forbiddenWords ?? [];
    const ctas = company.preferredCtas ?? [];
    const colors = [company.primaryColor, company.secondaryColor, company.accentColor].filter(
      Boolean,
    );

    const insights = [
      `Brand tone: ${tone}.`,
      forbidden.length
        ? `Avoid: ${forbidden.join(', ')}.`
        : 'No forbidden words configured.',
      ctas.length
        ? `Preferred CTAs: ${ctas.join(', ')}.`
        : 'Define preferred CTAs for consistency.',
    ];

    if (colors.length) {
      insights.push(`Brand palette: ${colors.join(', ')}.`);
    }

    const decisions = [
      'All copy must match tone and avoid forbidden terms.',
      ctas.length
        ? `Default CTA pool: ${ctas[0]}`
        : 'Use action-oriented CTAs aligned with brand voice.',
    ];

    const recommendations =
      ctas.length === 0
        ? [
            {
              type: 'OTHER',
              title: 'Define brand CTAs',
              description:
                'Add preferred CTAs in company settings to improve content consistency.',
              priority: 5,
            },
          ]
        : [];

    return {
      agent: this.type,
      insights,
      decisions,
      data: {
        tone,
        forbiddenWords: forbidden,
        preferredCtas: ctas,
        colors,
        typography: company.typography,
      },
      recommendations,
    };
  }
}
