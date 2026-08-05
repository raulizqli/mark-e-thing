// apps/api/src/application/use-cases/publishing/enqueue-publish.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { ContentRepository } from '../../../domain/repositories/content.repository';
import type { PublishRepository } from '../../../domain/repositories/publish.repository';
import type { PublishAdapterRegistry } from '../../../domain/services/publish-adapter.port';
import type { PublishJob } from '../../../domain/entities/publish.entity';
import type { PublishPlatform } from '../../../domain/types/enums';
import { AppError } from '../../../shared/errors/app-error';

export interface EnqueuePublishInput {
  companyId: string;
  contentId: string;
  platform: PublishPlatform;
  scheduledAt?: Date | null;
}

export class EnqueuePublishUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly contentRepository: ContentRepository,
    private readonly publishRepository: PublishRepository,
    private readonly publishAdapterRegistry: PublishAdapterRegistry,
  ) {}

  async execute(
    userId: string,
    input: EnqueuePublishInput,
  ): Promise<PublishJob> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      userId,
    );
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const content = await this.contentRepository.findByIdForCompany(
      input.contentId,
      input.companyId,
    );
    if (!content) {
      throw AppError.notFound('Content', input.contentId);
    }

    const connection = await this.publishRepository.findConnectionByPlatform(
      input.companyId,
      input.platform,
    );

    const adapter = this.publishAdapterRegistry.getAdapter(input.platform);
    const canPublishNow =
      adapter?.canPublish(connection ?? null) && connection !== null;

    let job = await this.publishRepository.createJob({
      companyId: input.companyId,
      contentId: input.contentId,
      platform: input.platform,
      status: canPublishNow ? 'QUEUED' : 'PENDING',
      scheduledAt: input.scheduledAt ?? content.scheduledAt,
    });

    if (canPublishNow && adapter && connection) {
      try {
        job = await this.publishRepository.updateJob(job.id, {
          status: 'PUBLISHING',
        });

        const result = await adapter.publish(content, connection);

        job = await this.publishRepository.updateJob(job.id, {
          status: 'SUCCEEDED',
          externalId: result.externalId,
          publishedAt: result.publishedAt,
          payload: result.payload ?? null,
        });

        await this.contentRepository.update(input.contentId, {
          status: 'PUBLISHED',
          publishedAt: result.publishedAt,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Publish failed';
        job = await this.publishRepository.updateJob(job.id, {
          status: 'FAILED',
          error: message,
        });
      }
    }

    return job;
  }
}
