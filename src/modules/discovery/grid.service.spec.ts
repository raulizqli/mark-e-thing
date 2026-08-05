// src/modules/discovery/grid.service.spec.ts
import { describe, expect, it } from 'vitest';
import { decomposeGrid, haversineMeters } from './grid.service.js';

describe('grid.service', () => {
  it('returns a single cell when radius fits in one cell', () => {
    const cells = decomposeGrid({
      center: { latitude: 19.4326, longitude: -99.1332 },
      radiusMeters: 400,
      cellRadiusMeters: 500,
    });

    expect(cells).toHaveLength(1);
    expect(cells[0]).toMatchObject({
      latitude: 19.4326,
      longitude: -99.1332,
      radiusMeters: 400,
    });
  });

  it('produces deterministic multi-cell coverage for a larger radius', () => {
    const input = {
      center: { latitude: 19.4326, longitude: -99.1332 },
      radiusMeters: 1500,
      cellRadiusMeters: 500,
      overlapRatio: 0.2,
    };

    const first = decomposeGrid(input);
    const second = decomposeGrid(input);

    expect(first.length).toBeGreaterThan(1);
    expect(first).toEqual(second);
  });

  it('keeps every cell within the search area plus cell radius', () => {
    const center = { latitude: 40.7128, longitude: -74.006 };
    const radiusMeters = 2000;
    const cellRadiusMeters = 500;

    const cells = decomposeGrid({
      center,
      radiusMeters,
      cellRadiusMeters,
    });

    for (const cell of cells) {
      const distance = haversineMeters(center, cell);
      expect(distance).toBeLessThanOrEqual(radiusMeters + cellRadiusMeters + 1);
    }
  });
});
