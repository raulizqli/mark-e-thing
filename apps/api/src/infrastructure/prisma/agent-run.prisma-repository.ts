// apps/api/src/infrastructure/prisma/agent-run.prisma-repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type {
  AgentRun,
  AgentStep,
  CreateAgentRunData,
  CreateAgentStepData,
  UpdateAgentRunData,
} from '@domain/entities/agent.entity';
import type { AgentRunRepository } from '@domain/repositories/agent-run.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AgentRunPrismaRepository implements AgentRunRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: CreateAgentRunData): Promise<AgentRun> {
    const row = await this.prisma.agentRun.create({
      data: {
        companyId: data.companyId,
        status: data.status,
        goal: data.goal ?? null,
        summary: data.summary ?? null,
        plan: data.plan as Prisma.InputJsonValue | undefined,
        error: data.error ?? null,
        startedAt: data.startedAt ?? null,
        finishedAt: data.finishedAt ?? null,
      },
    });
    return this.mapRun(row);
  }

  async update(id: string, data: UpdateAgentRunData): Promise<AgentRun> {
    const row = await this.prisma.agentRun.update({
      where: { id },
      data: {
        status: data.status,
        goal: data.goal,
        summary: data.summary,
        plan: data.plan as Prisma.InputJsonValue | undefined,
        error: data.error,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
      },
    });
    return this.mapRun(row);
  }

  async findById(id: string): Promise<AgentRun | null> {
    const row = await this.prisma.agentRun.findUnique({ where: { id } });
    return row ? this.mapRun(row) : null;
  }

  async findByIdForCompany(id: string, companyId: string): Promise<AgentRun | null> {
    const row = await this.prisma.agentRun.findFirst({ where: { id, companyId } });
    return row ? this.mapRun(row) : null;
  }

  async findAllByCompanyId(companyId: string): Promise<AgentRun[]> {
    const rows = await this.prisma.agentRun.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.mapRun(row));
  }

  async createStep(data: CreateAgentStepData): Promise<AgentStep> {
    const row = await this.prisma.agentStep.create({
      data: {
        runId: data.runId,
        agent: data.agent,
        status: data.status,
        input: data.input as Prisma.InputJsonValue | undefined,
        output: data.output as Prisma.InputJsonValue | undefined,
        provider: data.provider ?? null,
        model: data.model ?? null,
        latencyMs: data.latencyMs ?? null,
        error: data.error ?? null,
      },
    });
    return this.mapStep(row);
  }

  async findStepsByRunId(runId: string): Promise<AgentStep[]> {
    const rows = await this.prisma.agentStep.findMany({
      where: { runId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.mapStep(row));
  }

  private mapRun(row: {
    id: string;
    companyId: string;
    status: AgentRun['status'];
    goal: string | null;
    summary: string | null;
    plan: Prisma.JsonValue;
    error: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
  }): AgentRun {
    return {
      id: row.id,
      companyId: row.companyId,
      status: row.status,
      goal: row.goal,
      summary: row.summary,
      plan: row.plan as Record<string, unknown> | null,
      error: row.error,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      createdAt: row.createdAt,
    };
  }

  private mapStep(row: {
    id: string;
    runId: string;
    agent: AgentStep['agent'];
    status: AgentStep['status'];
    input: Prisma.JsonValue;
    output: Prisma.JsonValue;
    provider: string | null;
    model: string | null;
    latencyMs: number | null;
    error: string | null;
    createdAt: Date;
  }): AgentStep {
    return {
      id: row.id,
      runId: row.runId,
      agent: row.agent,
      status: row.status,
      input: row.input as Record<string, unknown> | null,
      output: row.output as Record<string, unknown> | null,
      provider: row.provider,
      model: row.model,
      latencyMs: row.latencyMs,
      error: row.error,
      createdAt: row.createdAt,
    };
  }
}
