// src/modules/places/places.client.spec.ts
import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { PlacesClient } from './places.client.js';

describe('PlacesClient', () => {
  it('paginates searchNearby results', async () => {
    const post = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          places: [{ id: 'places/1' }],
          nextPageToken: 'token-2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          places: [{ id: 'places/2' }],
        },
      });

    const http = { post } as unknown as AxiosInstance;
    const client = new PlacesClient(http);

    const places = await client.searchNearby({
      textQuery: 'cafe',
      latitude: 19.4,
      longitude: -99.1,
      radiusMeters: 500,
    });

    expect(places.map((place) => place.id)).toEqual(['places/1', 'places/2']);
    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[0][2].headers['X-Goog-FieldMask']).toContain(
      'places.id',
    );
  });

  it('retries failed requests then succeeds', async () => {
    const post = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        data: { places: [{ id: 'places/ok' }] },
      });

    const http = { post } as unknown as AxiosInstance;
    const client = new PlacesClient(http);

    const places = await client.searchNearby({
      textQuery: 'cafe',
      latitude: 19.4,
      longitude: -99.1,
      radiusMeters: 500,
    });

    expect(places).toHaveLength(1);
    expect(post).toHaveBeenCalledTimes(2);
  });
});
