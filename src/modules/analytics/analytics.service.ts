// src/modules/analytics/analytics.service.ts
import { NotFoundError } from '../../shared/errors/app-error.js';
import { SearchRepository } from '../search/search.repository.js';
import {
  AnalyticsRepository,
  type SearchAnalyticsSnapshot,
} from './analytics.repository.js';

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository = new AnalyticsRepository(),
    private readonly searchRepository: SearchRepository = new SearchRepository(),
  ) {}

  async getSearchAnalytics(
    searchId: string,
    userId: string,
  ): Promise<SearchAnalyticsSnapshot> {
    const search = await this.searchRepository.findById(searchId);
    if (!search || search.userId !== userId) {
      throw new NotFoundError(`Search ${searchId} not found`);
    }

    return this.analyticsRepository.getSearchAnalytics(searchId);
  }
}
