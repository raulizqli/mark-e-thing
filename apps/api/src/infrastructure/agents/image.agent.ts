// apps/api/src/infrastructure/agents/image.agent.ts

import type {
  AgentContext,
  AgentResult,
  MarketingAgent,
} from '@domain/agents/agent.port';
import type { AgentType } from '@domain/types/agent-enums';

export class ImageAgent implements MarketingAgent {
  readonly type: AgentType = 'IMAGE';

  async run(ctx: AgentContext): Promise<AgentResult> {
    const { company } = ctx;
    const brand = ctx.previousSteps.brand as Record<string, unknown> | undefined;
    const colors = (brand?.colors as string[]) ?? [];
    const tone = (brand?.tone as string) ?? company.toneOfVoice ?? 'professional';

    const briefs = [
      {
        title: 'Hero brand visual',
        prompt: `${company.name} brand hero image, ${tone} tone${colors.length ? `, colors ${colors.join(', ')}` : ''}`,
        format: 'square',
      },
      {
        title: 'Product/service showcase',
        prompt: `Showcase ${company.services[0] ?? company.products[0] ?? 'offering'} for ${company.name}`,
        format: 'portrait',
      },
      {
        title: 'Social story frame',
        prompt: `Vertical story frame for ${company.name}, ${company.industry ?? 'business'} style`,
        format: 'story',
      },
    ];

    const insights = [
      `${briefs.length} visual briefs prepared.`,
      colors.length
        ? `Use brand colors: ${colors.join(', ')}.`
        : 'Define brand colors for visual consistency.',
    ];

    const decisions = [
      'Generate images before scheduling posts.',
      'Keep text overlay minimal on visuals.',
    ];

    const recommendations = briefs.map((brief, i) => ({
      type: 'CREATE_CONTENT',
      title: brief.title,
      description: `Visual brief: ${brief.prompt}`,
      priority: 5 - i,
      payload: brief,
    }));

    return {
      agent: this.type,
      insights,
      decisions,
      data: { briefs },
      recommendations,
    };
  }
}
