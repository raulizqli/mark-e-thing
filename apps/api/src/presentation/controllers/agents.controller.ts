// apps/api/src/presentation/controllers/agents.controller.ts

import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { GetAgentRunUseCase } from '@application/use-cases/agents/get-agent-run.use-case';
import { GetAiSettingsUseCase } from '@application/use-cases/agents/get-ai-settings.use-case';
import { ListAgentRunsUseCase } from '@application/use-cases/agents/list-agent-runs.use-case';
import { ListRecommendationsUseCase } from '@application/use-cases/agents/list-recommendations.use-case';
import { RunMarketingAgentUseCase } from '@application/use-cases/agents/run-marketing-agent.use-case';
import { UpdateRecommendationStatusUseCase } from '@application/use-cases/agents/update-recommendation-status.use-case';
import { UpsertAiSettingsUseCase } from '@application/use-cases/agents/upsert-ai-settings.use-case';
import type {
  ListRecommendationsQuery,
  UpdateRecommendationStatusInput,
  UpsertAiSettingsInput,
} from '@application/dto/agent.dto';
import type { RecommendationStatus } from '@domain/types/agent-enums';
import type { RequestWithUser } from '../middleware/dev-user.middleware';

@Controller('companies/:companyId')
export class AgentsController {
  constructor(
    @Inject(RunMarketingAgentUseCase)
    private readonly runMarketingAgent: RunMarketingAgentUseCase,
    @Inject(ListAgentRunsUseCase)
    private readonly listAgentRuns: ListAgentRunsUseCase,
    @Inject(GetAgentRunUseCase)
    private readonly getAgentRun: GetAgentRunUseCase,
    @Inject(ListRecommendationsUseCase)
    private readonly listRecommendations: ListRecommendationsUseCase,
    @Inject(UpdateRecommendationStatusUseCase)
    private readonly updateRecommendationStatus: UpdateRecommendationStatusUseCase,
    @Inject(GetAiSettingsUseCase)
    private readonly getAiSettings: GetAiSettingsUseCase,
    @Inject(UpsertAiSettingsUseCase)
    private readonly upsertAiSettings: UpsertAiSettingsUseCase,
  ) {}

  @Post('agent/run')
  async runAgent(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: { goal?: string },
  ) {
    const data = await this.runMarketingAgent.execute(req.user!.id, {
      companyId,
      goal: body.goal,
    });
    return { success: true, data };
  }

  @Get('agent/runs')
  async listRuns(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    const data = await this.listAgentRuns.execute(req.user!.id, companyId);
    return { success: true, data };
  }

  @Get('agent/runs/:runId')
  async getRun(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('runId') runId: string,
  ) {
    const data = await this.getAgentRun.execute(req.user!.id, companyId, runId);
    return { success: true, data };
  }

  @Get('recommendations')
  async listRecs(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Query('status') status?: RecommendationStatus,
  ) {
    const query: ListRecommendationsQuery = status ? { status } : {};
    const data = await this.listRecommendations.execute(
      req.user!.id,
      companyId,
      query,
    );
    return { success: true, data };
  }

  @Patch('recommendations/:id')
  async updateRec(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: UpdateRecommendationStatusInput,
  ) {
    const data = await this.updateRecommendationStatus.execute(
      req.user!.id,
      companyId,
      id,
      body,
    );
    return { success: true, data };
  }

  @Get('ai-settings')
  async getSettings(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    const data = await this.getAiSettings.execute(req.user!.id, companyId);
    return { success: true, data };
  }

  @Put('ai-settings')
  async putSettings(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: UpsertAiSettingsInput,
  ) {
    const data = await this.upsertAiSettings.execute(req.user!.id, companyId, body);
    return { success: true, data };
  }
}
