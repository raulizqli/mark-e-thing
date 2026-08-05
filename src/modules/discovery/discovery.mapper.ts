// src/modules/discovery/discovery.mapper.ts
import type { Prisma } from '@prisma/client';
import type { PlacesPlace } from '../places/places.types.js';

export function mapPlaceToBusinessCreate(
  place: PlacesPlace,
): Prisma.BusinessCreateInput | null {
  if (!place.id || !place.location) {
    return null;
  }

  const name = place.displayName?.text?.trim();
  if (!name) {
    return null;
  }

  return {
    googlePlaceId: place.id,
    name,
    formattedAddress: place.formattedAddress ?? '',
    websiteUri: place.websiteUri ?? null,
    nationalPhoneNumber: place.nationalPhoneNumber ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    currentOpeningHours: place.currentOpeningHours
      ? (place.currentOpeningHours as Prisma.InputJsonValue)
      : undefined,
    businessStatus: place.businessStatus ?? null,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    googleMapsUri: place.googleMapsUri ?? null,
    primaryType: place.primaryType ?? null,
    types: place.types ?? [],
  };
}
