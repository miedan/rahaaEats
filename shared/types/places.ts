export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetailsResult {
  formattedAddress: string;
  district: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  district?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  profilePhotoUrl?: string;
}
