import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { ENV } from '../config/env';

const PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function autocomplete(req: Request, res: Response): Promise<void> {
  try {
    const { q, lat, lng } = req.query as { q?: string; lat?: string; lng?: string };

    if (!q || q.trim().length < 2) {
      sendSuccess(res, []);
      return;
    }

    const params = new URLSearchParams({
      input: q,
      key: ENV.GOOGLE_MAPS_API_KEY,
      components: 'country:rw',
      language: 'en',
    });

    if (lat && lng) {
      params.set('location', `${lat},${lng}`);
      params.set('radius', '50000');
    }

    const response = await fetch(`${PLACES_AUTOCOMPLETE_URL}?${params}`);
    const data = await response.json() as {
      status: string;
      predictions: Array<{
        place_id: string;
        description: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }>;
    };

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      sendError(res, 502, 'PLACES_ERROR', `Places API error: ${data.status}`);
      return;
    }

    const results = (data.predictions ?? []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? '',
    }));

    sendSuccess(res, results);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch autocomplete results');
  }
}

export async function placeDetails(req: Request, res: Response): Promise<void> {
  try {
    const { placeId } = req.query as { placeId?: string };

    if (!placeId) {
      sendError(res, 422, 'VALIDATION_ERROR', 'placeId is required');
      return;
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: ENV.GOOGLE_MAPS_API_KEY,
      fields: 'formatted_address,geometry,address_component',
      language: 'en',
    });

    const response = await fetch(`${PLACE_DETAILS_URL}?${params}`);
    const data = await response.json() as {
      status: string;
      result?: {
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
        address_components: Array<{ long_name: string; types: string[] }>;
      };
    };

    if (data.status !== 'OK' || !data.result) {
      sendError(res, 502, 'PLACES_ERROR', `Place details API error: ${data.status}`);
      return;
    }

    const district =
      data.result.address_components.find((c) => c.types.includes('administrative_area_level_2'))
        ?.long_name ??
      data.result.address_components.find((c) => c.types.includes('locality'))?.long_name ??
      '';

    sendSuccess(res, {
      formattedAddress: data.result.formatted_address,
      district,
      lat: data.result.geometry.location.lat,
      lng: data.result.geometry.location.lng,
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch place details');
  }
}

export async function reverseGeocode(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng } = req.query as { lat?: string; lng?: string };

    if (!lat || !lng) {
      sendError(res, 422, 'VALIDATION_ERROR', 'lat and lng are required');
      return;
    }

    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: ENV.GOOGLE_MAPS_API_KEY,
      language: 'en',
    });

    const response = await fetch(`${GEOCODE_URL}?${params}`);
    const data = await response.json() as {
      status: string;
      results: Array<{
        formatted_address: string;
        address_components: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
        geometry: {
          location: { lat: number; lng: number };
        };
      }>;
    };

    if (data.status !== 'OK' || !data.results.length) {
      sendSuccess(res, { formattedAddress: `${lat}, ${lng}` });
      return;
    }

    const result = data.results[0];
    const components = result.address_components;

    const getComponent = (type: string) =>
      components.find((c) => c.types.includes(type))?.long_name ?? null;

    sendSuccess(res, {
      formattedAddress: result.formatted_address,
      district: getComponent('administrative_area_level_2') ?? getComponent('locality') ?? '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to reverse geocode');
  }
}
