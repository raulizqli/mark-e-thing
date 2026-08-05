// src/modules/places/places.types.ts
export interface PlacesLocation {
  latitude: number;
  longitude: number;
}

export interface PlacesOpeningHours {
  openNow?: boolean;
  weekdayDescriptions?: string[];
}

export interface PlacesPlace {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: PlacesOpeningHours;
  businessStatus?: string;
  location?: PlacesLocation;
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
}

export interface PlacesSearchTextRequest {
  textQuery: string;
  locationBias?: {
    circle: {
      center: PlacesLocation;
      radius: number;
    };
  };
  pageToken?: string;
  pageSize?: number;
}

export interface PlacesSearchTextResponse {
  places?: PlacesPlace[];
  nextPageToken?: string;
}

export interface NearbySearchParams {
  textQuery: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}
