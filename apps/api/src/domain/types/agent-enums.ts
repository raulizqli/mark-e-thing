// apps/api/src/domain/types/agent-enums.ts

export type AgentType =
  | 'ORCHESTRATOR'
  | 'BRAND'
  | 'CONTENT'
  | 'IMAGE'
  | 'SEO'
  | 'SOCIAL'
  | 'ANALYTICS'
  | 'CAMPAIGN'
  | 'TREND'
  | 'PLANNER';

export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type RecommendationType =
  | 'PUBLISH'
  | 'SCHEDULE'
  | 'RECYCLE'
  | 'CREATE_CONTENT'
  | 'PAUSE_CAMPAIGN'
  | 'REPEAT_CAMPAIGN'
  | 'CREATE_PROMOTION'
  | 'TARGET_AUDIENCE'
  | 'AD_BUDGET'
  | 'FUNNEL'
  | 'MONTHLY_PLAN'
  | 'OTHER';

export type RecommendationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXECUTED';
