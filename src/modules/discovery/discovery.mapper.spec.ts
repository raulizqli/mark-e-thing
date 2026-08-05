// src/modules/discovery/discovery.mapper.spec.ts
import { describe, expect, it } from 'vitest';
import type { PlacesPlace } from '../places/places.types.js';
import { mapPlaceToBusinessCreate } from './discovery.mapper.js';

describe('discovery.mapper', () => {
  const validPlace: PlacesPlace = {
    id: 'places/abc123',
    displayName: { text: 'Cafe Central' },
    formattedAddress: '1 Main St',
    websiteUri: 'https://example.com',
    nationalPhoneNumber: '+1 555 0100',
    rating: 4.5,
    userRatingCount: 120,
    currentOpeningHours: { openNow: true },
    businessStatus: 'OPERATIONAL',
    location: { latitude: 19.4, longitude: -99.1 },
    googleMapsUri: 'https://maps.google.com/?cid=1',
    primaryType: 'cafe',
    types: ['cafe', 'food'],
  };

  it('maps a Places payload to Business create input', () => {
    expect(mapPlaceToBusinessCreate(validPlace)).toEqual({
      googlePlaceId: 'places/abc123',
      name: 'Cafe Central',
      formattedAddress: '1 Main St',
      websiteUri: 'https://example.com',
      nationalPhoneNumber: '+1 555 0100',
      rating: 4.5,
      userRatingCount: 120,
      currentOpeningHours: { openNow: true },
      businessStatus: 'OPERATIONAL',
      latitude: 19.4,
      longitude: -99.1,
      googleMapsUri: 'https://maps.google.com/?cid=1',
      primaryType: 'cafe',
      types: ['cafe', 'food'],
    });
  });

  it('returns null when required fields are missing', () => {
    expect(mapPlaceToBusinessCreate({ ...validPlace, id: '' })).toBeNull();
    expect(
      mapPlaceToBusinessCreate({ ...validPlace, location: undefined }),
    ).toBeNull();
    expect(
      mapPlaceToBusinessCreate({
        ...validPlace,
        displayName: { text: '   ' },
      }),
    ).toBeNull();
  });
});
