-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ORCHESTRATOR', 'BRAND', 'CONTENT', 'IMAGE', 'SEO', 'SOCIAL', 'ANALYTICS', 'CAMPAIGN', 'TREND', 'PLANNER');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('PUBLISH', 'SCHEDULE', 'RECYCLE', 'CREATE_CONTENT', 'PAUSE_CAMPAIGN', 'REPEAT_CAMPAIGN', 'CREATE_PROMOTION', 'TARGET_AUDIENCE', 'AD_BUDGET', 'FUNNEL', 'MONTHLY_PLAN', 'OTHER');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXECUTED');

-- CreateTable
CREATE TABLE "company_ai_settings" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "content_provider" TEXT,
    "content_model" TEXT,
    "image_provider" TEXT,
    "image_model" TEXT,
    "reasoning_provider" TEXT,
    "reasoning_model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_snapshots" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "platform" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "best_hours" JSONB,
    "raw" JSONB,
    "source" TEXT NOT NULL DEFAULT 'mock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "status" "AgentRunStatus" NOT NULL,
    "goal" TEXT,
    "summary" TEXT,
    "plan" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_steps" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "agent" "AgentType" NOT NULL,
    "status" "AgentRunStatus" NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "provider" TEXT,
    "model" TEXT,
    "latency_ms" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "run_id" TEXT,
    "type" "RecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_ai_settings_company_id_key" ON "company_ai_settings"("company_id");

-- CreateIndex
CREATE INDEX "metrics_snapshots_company_id_period_end_idx" ON "metrics_snapshots"("company_id", "period_end");

-- CreateIndex
CREATE INDEX "agent_runs_company_id_created_at_idx" ON "agent_runs"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_steps_run_id_idx" ON "agent_steps"("run_id");

-- CreateIndex
CREATE INDEX "recommendations_company_id_status_idx" ON "recommendations"("company_id", "status");

-- AddForeignKey
ALTER TABLE "company_ai_settings" ADD CONSTRAINT "company_ai_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_snapshots" ADD CONSTRAINT "metrics_snapshots_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_steps" ADD CONSTRAINT "agent_steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
