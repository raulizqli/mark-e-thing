// src/modules/discovery/discovery.service.ts
import { logger } from '../../shared/logger/logger.js';
import { BusinessRepository } from '../business/business.repository.js';
import { PlacesClient } from '../places/places.client.js';
import type { PlacesPlace } from '../places/places.types.js';
import { SearchRepository } from '../search/search.repository.js';
import { mapPlaceToBusinessCreate } from './discovery.mapper.js';
import { decomposeGrid } from './grid.service.js';

export interface DiscoveryInput {
  searchId: string;
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface DiscoveryResult {
  searchId: string;
  totalFound: number;
  businessIds: string[];
}

export type ProgressReporter = (progress: {
  cellsCompleted: number;
  cellsTotal: number;
  totalFound: number;
}) => Promise<void> | void;

export class DiscoveryService {
  constructor(
    private readonly placesClient: PlacesClient = new PlacesClient(),
    private readonly businessRepository: BusinessRepository = new BusinessRepository(),
    private readonly searchRepository: SearchRepository = new SearchRepository(),
  ) {}

  async run(
    input: DiscoveryInput,
    onProgress?: ProgressReporter,
  ): Promise<DiscoveryResult> {
    await this.searchRepository.updateStatus(input.searchId, 'PROCESSING');

    const cells = decomposeGrid({
      center: { latitude: input.latitude, longitude: input.longitude },
      radiusMeters: input.radiusMeters,
    });

    const seenPlaceIds = new Set<string>();
    const businessIds: string[] = [];

    for (let index = 0; index < cells.length; index += 1) {
      const cell = cells[index];
      const places = await this.placesClient.searchNearby({
        textQuery: input.category,
        latitude: cell.latitude,
        longitude: cell.longitude,
        radiusMeters: cell.radiusMeters,
      });

      for (const place of places) {
        const businessId = await this.persistPlace(
          input.searchId,
          place,
          seenPlaceIds,
        );
        if (businessId) {
          businessIds.push(businessId);
        }
      }

      await this.searchRepository.updateProgress(input.searchId, {
        totalFound: businessIds.length,
      });

      await onProgress?.({
        cellsCompleted: index + 1,
        cellsTotal: cells.length,
        totalFound: businessIds.length,
      });
    }

    logger.info(
      { searchId: input.searchId, totalFound: businessIds.length },
      'Discovery completed',
    );

    return {
      searchId: input.searchId,
      totalFound: businessIds.length,
      businessIds,
    };
  }

  private async persistPlace(
    searchId: string,
    place: PlacesPlace,
    seenPlaceIds: Set<string>,
  ): Promise<string | null> {
    if (!place.id || seenPlaceIds.has(place.id)) {
      return null;
    }

    const createInput = mapPlaceToBusinessCreate(place);
    if (!createInput) {
      return null;
    }

    seenPlaceIds.add(place.id);
    const business =
      await this.businessRepository.upsertByGooglePlaceId(createInput);
    await this.businessRepository.linkToSearch(searchId, business.id);
    return business.id;
  }
}
