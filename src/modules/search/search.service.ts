// src/modules/search/search.service.ts
import type { Search } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { enqueueDiscoveryJob } from '../jobs/discovery.queue.js';
import type { CreateSearchDto } from './search.dto.js';
import { SearchRepository } from './search.repository.js';

export interface SearchStatusView {
  id: string;
  status: Search['status'];
  totalFound: number;
  progress: number;
}

export class SearchService {
  constructor(
    private readonly searchRepository: SearchRepository = new SearchRepository(),
    private readonly enqueueDiscovery: typeof enqueueDiscoveryJob = enqueueDiscoveryJob,
  ) {}

  async createSearch(userId: string, dto: CreateSearchDto): Promise<Search> {
    const search = await this.searchRepository.create({
      category: dto.category,
      city: dto.city,
      neighborhood: dto.neighborhood,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      radius: dto.radiusMeters,
      status: 'PENDING',
      user: { connect: { id: userId } },
    });

    await this.enqueueDiscovery({
      searchId: search.id,
      category: dto.category,
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusMeters: dto.radiusMeters,
    });

    return search;
  }

  async getSearch(id: string, userId: string): Promise<Search> {
    const search = await this.searchRepository.findById(id);
    if (!search || search.userId !== userId) {
      throw new NotFoundError(`Search ${id} not found`);
    }
    return search;
  }

  async getStatus(id: string, userId: string): Promise<SearchStatusView> {
    const search = await this.getSearch(id, userId);
    return {
      id: search.id,
      status: search.status,
      totalFound: search.totalFound,
      progress: statusToProgress(search.status),
    };
  }
}

function statusToProgress(status: Search['status']): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'PROCESSING':
      return 50;
    case 'COMPLETED':
      return 100;
    case 'FAILED':
      return 0;
    default:
      return 0;
  }
}
