// src/modules/discovery/grid.service.ts
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GridCell extends GeoPoint {
  radiusMeters: number;
}

export interface GridDecompositionInput {
  center: GeoPoint;
  radiusMeters: number;
  /** Maximum results Places returns per query; drives cell sizing. */
  cellRadiusMeters?: number;
  /** Overlap ratio between adjacent cells (0–1) to avoid edge misses. */
  overlapRatio?: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const DEFAULT_CELL_RADIUS_METERS = 500;
const DEFAULT_OVERLAP_RATIO = 0.2;

/**
 * Decomposes a circular search area into overlapping grid cells so each
 * Places query stays under the API's per-query result ceiling.
 */
export function decomposeGrid(input: GridDecompositionInput): GridCell[] {
  const cellRadius = input.cellRadiusMeters ?? DEFAULT_CELL_RADIUS_METERS;
  const overlapRatio = input.overlapRatio ?? DEFAULT_OVERLAP_RATIO;
  const stepMeters = cellRadius * 2 * (1 - overlapRatio);

  if (input.radiusMeters <= cellRadius) {
    return [
      {
        latitude: input.center.latitude,
        longitude: input.center.longitude,
        radiusMeters: input.radiusMeters,
      },
    ];
  }

  const cells: GridCell[] = [];
  const latStep = metersToLatitudeDegrees(stepMeters);
  const startLat = input.center.latitude - metersToLatitudeDegrees(input.radiusMeters);
  const endLat = input.center.latitude + metersToLatitudeDegrees(input.radiusMeters);

  for (let lat = startLat; lat <= endLat + latStep / 2; lat += latStep) {
    const lngStep = metersToLongitudeDegrees(stepMeters, lat);
    const startLng =
      input.center.longitude - metersToLongitudeDegrees(input.radiusMeters, lat);
    const endLng =
      input.center.longitude + metersToLongitudeDegrees(input.radiusMeters, lat);

    for (let lng = startLng; lng <= endLng + lngStep / 2; lng += lngStep) {
      const distance = haversineMeters(input.center, { latitude: lat, longitude: lng });
      if (distance <= input.radiusMeters + cellRadius) {
        cells.push({
          latitude: roundCoord(lat),
          longitude: roundCoord(lng),
          radiusMeters: cellRadius,
        });
      }
    }
  }

  return cells;
}

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = degreesToRadians(b.latitude - a.latitude);
  const dLng = degreesToRadians(b.longitude - a.longitude);
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function metersToLatitudeDegrees(meters: number): number {
  return (meters / EARTH_RADIUS_METERS) * (180 / Math.PI);
}

function metersToLongitudeDegrees(meters: number, latitude: number): number {
  const metersPerDegree =
    (EARTH_RADIUS_METERS * Math.cos(degreesToRadians(latitude)) * Math.PI) / 180;
  return meters / metersPerDegree;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function roundCoord(value: number): number {
  return Number(value.toFixed(6));
}
