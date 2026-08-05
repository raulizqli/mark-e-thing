// apps/api/src/infrastructure/agents/orchestrator.service.ts

import type {
  AgentContext,
  AgentRecommendation,
  AgentResult,
  MarketingAgent,
  MarketingOrchestratorPort,
  OrchestratorInput,
  OrchestratorOutput,
  OrchestratorStepResult,
} from '@domain/agents/agent.port';
import type { AiGatewayPort } from '@domain/services/ai-gateway.port';
import type { AgentType } from '@domain/types/agent-enums';
import { AnalyticsAgent } from './analytics.agent';
import { BrandAgent } from './brand.agent';
import { CampaignAgent } from './campaign.agent';
import { ContentAgent } from './content.agent';
import { ImageAgent } from './image.agent';
import { PlannerAgent } from './planner.agent';
import { SeoAgent } from './seo.agent';
import { SocialAgent } from './social.agent';
import { TrendAgent } from './trend.agent';

const AGENT_ORDER: AgentType[] = [
  'ANALYTICS',
  'TREND',
  'BRAND',
  'CAMPAIGN',
  'PLANNER',
  'CONTENT',
  'SEO',
  'SOCIAL',
  'IMAGE',
];

function agentKey(type: AgentType): string {
  return type.toLowerCase();
}

export class MarketingOrchestratorService implements MarketingOrchestratorPort {
  private readonly agents: MarketingAgent[];

  constructor(private readonly aiGateway?: AiGatewayPort) {
    this.agents = [
      new AnalyticsAgent(),
      new TrendAgent(),
      new BrandAgent(),
      new CampaignAgent(),
      new PlannerAgent(),
      new ContentAgent(),
      new SeoAgent(),
      new SocialAgent(),
      new ImageAgent(),
    ];
  }

  async run(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const previousSteps: Record<string, unknown> = {};
    const steps: OrchestratorStepResult[] = [];
    const allRecommendations: AgentRecommendation[] = [];
    const allInsights: string[] = [];
    const allDecisions: string[] = [];

    const baseCtx: Omit<AgentContext, 'previousSteps'> = {
      company: input.company,
      knowledgeTexts: input.knowledgeTexts,
      recentContents: input.recentContents,
      metrics: input.metrics,
      goal: input.goal,
    };

    for (const agentType of AGENT_ORDER) {
      const agent = this.agents.find((a) => a.type === agentType);
      if (!agent) continue;

      const stepInput = { goal: input.goal, previousAgents: Object.keys(previousSteps) };
      const started = Date.now();

      try {
        const result = await agent.run({ ...baseCtx, previousSteps });
        const latencyMs = Date.now() - started;

        previousSteps[agentKey(agentType)] = result.data;
        allInsights.push(...result.insights);
        allDecisions.push(...result.decisions);
        allRecommendations.push(...result.recommendations);

        steps.push({
          agent: agentType,
          status: 'COMPLETED',
          input: stepInput,
          output: {
            insights: result.insights,
            decisions: result.decisions,
            data: result.data,
            recommendationCount: result.recommendations.length,
          },
          provider: 'heuristic',
          model: null,
          latencyMs,
          error: null,
          result,
        });
      } catch (err) {
        const latencyMs = Date.now() - started;
        const message = err instanceof Error ? err.message : 'Agent failed';

        steps.push({
          agent: agentType,
          status: 'FAILED',
          input: stepInput,
          output: null,
          provider: 'heuristic',
          model: null,
          latencyMs,
          error: message,
          result: null,
        });
      }
    }

    const plan = this.buildPlan(input, previousSteps, allRecommendations);
    const summary = await this.buildSummary(input, allInsights, allDecisions, plan);

    return {
      summary,
      plan,
      steps,
      recommendations: this.dedupeRecommendations(allRecommendations),
    };
  }

  private buildPlan(
    input: OrchestratorInput,
    previousSteps: Record<string, unknown>,
    recommendations: AgentRecommendation[],
  ): Record<string, unknown> {
    const planner = previousSteps.planner as Record<string, unknown> | undefined;
    const analytics = previousSteps.analytics as Record<string, unknown> | undefined;

    return {
      goal: input.goal ?? 'monthly_plan',
      companyId: input.companyId,
      generatedAt: new Date().toISOString(),
      weeklyPlan: planner?.weeklyPlan ?? null,
      bestHours: analytics?.bestHours ?? [9, 12, 18],
      engagementRate: analytics?.engagementRate ?? null,
      agentOutputs: previousSteps,
      recommendationCount: recommendations.length,
      topRecommendations: recommendations
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        .slice(0, 5),
    };
  }

  private async buildSummary(
    input: OrchestratorInput,
    insights: string[],
    decisions: string[],
    plan: Record<string, unknown>,
  ): Promise<string> {
    if (this.aiGateway) {
      try {
        const response = await this.aiGateway.complete({
          capability: 'reasoning',
          system:
            'You are a digital marketing director. Write concise executive summaries in plain language.',
          user: [
            `Company: ${input.company.name}.`,
            `Goal: ${input.goal ?? 'monthly marketing plan'}.`,
            `Key insights: ${insights.slice(0, 5).join('; ')}.`,
            `Key decisions: ${decisions.slice(0, 5).join('; ')}.`,
            'Write a 3-4 sentence executive summary.',
          ].join('\n'),
        });

        return response.text;
      } catch {
        // fall through to template
      }
    }

    const recCount = (plan.recommendationCount as number) ?? 0;
    return [
      `Marketing agent run completed for ${input.company.name}.`,
      `${insights.length} insights and ${decisions.length} strategic decisions were produced.`,
      `${recCount} actionable recommendations are ready for review.`,
      `Focus: ${input.goal ?? 'monthly content and campaign planning'}.`,
    ].join(' ');
  }

  private dedupeRecommendations(
    recommendations: AgentRecommendation[],
  ): AgentRecommendation[] {
    const seen = new Set<string>();
    return recommendations
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .filter((rec) => {
        const key = `${rec.type}:${rec.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }
}

export function summarizeAgentResult(result: AgentResult): Record<string, unknown> {
  return {
    insights: result.insights,
    decisions: result.decisions,
    data: result.data,
    recommendationCount: result.recommendations.length,
  };
}
