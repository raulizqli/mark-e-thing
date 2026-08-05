// src/modules/places/places.client.ts
import axios, { type AxiosInstance } from 'axios';
import { env } from '../../config/env.config.js';
import { logger } from '../../shared/logger/logger.js';
import { buildFieldMaskHeader } from './places.field-mask.js';
import type {
  NearbySearchParams,
  PlacesPlace,
  PlacesSearchTextRequest,
  PlacesSearchTextResponse,
} from './places.types.js';

const PLACES_BASE_URL = 'https://places.googleapis.com/v1';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 250;

export class PlacesClient {
  constructor(private readonly http: AxiosInstance = createDefaultHttpClient()) {}

  async searchNearby(params: NearbySearchParams): Promise<PlacesPlace[]> {
    const places: PlacesPlace[] = [];
    let pageToken: string | undefined;

    do {
      const body: PlacesSearchTextRequest = {
        textQuery: params.textQuery,
        locationBias: {
          circle: {
            center: {
              latitude: params.latitude,
              longitude: params.longitude,
            },
            radius: params.radiusMeters,
          },
        },
        pageSize: 20,
        pageToken,
      };

      const response = await this.requestWithRetry(body);
      places.push(...(response.places ?? []));
      pageToken = response.nextPageToken;
    } while (pageToken);

    return places;
  }

  private async requestWithRetry(
    body: PlacesSearchTextRequest,
    attempt = 1,
  ): Promise<PlacesSearchTextResponse> {
    try {
      const { data } = await this.http.post<PlacesSearchTextResponse>(
        '/places:searchText',
        body,
        {
          headers: {
            'X-Goog-FieldMask': buildFieldMaskHeader(),
          },
        },
      );
      return data;
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }

      const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
      logger.warn({ attempt, delayMs }, 'Places API request failed; retrying');
      await sleep(delayMs);
      return this.requestWithRetry(body, attempt + 1);
    }
  }
}

function createDefaultHttpClient(): AxiosInstance {
  return axios.create({
    baseURL: PLACES_BASE_URL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
