// src/modules/places/places.field-mask.ts
/** Field mask paths mapped to Business model columns (cost-controlled Places responses). */
export const PLACES_FIELD_PATHS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.currentOpeningHours',
  'places.businessStatus',
  'places.location',
  'places.googleMapsUri',
  'places.primaryType',
  'places.types',
] as const;

export type PlacesFieldPath = (typeof PLACES_FIELD_PATHS)[number];

export function buildFieldMaskHeader(
  fields: readonly PlacesFieldPath[] = PLACES_FIELD_PATHS,
): string {
  return fields.join(',');
}
