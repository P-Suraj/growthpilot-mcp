import { Injectable } from '@nitrostack/core';
import { DiscoveryProvider } from './discovery.provider.js';
import { Campaign, Company } from '../../shared/models.js';

// ---------------------------------------------------------------------------
// Geocode cache — avoids re-geocoding the same city on every campaign
// ---------------------------------------------------------------------------
interface LatLng { lat: number; lng: number }
const geocodeCache = new Map<string, LatLng>();

async function geocodeCity(city: string, state: string, apiKey: string): Promise<LatLng | null> {
  const cacheKey = `${city},${state}`.toLowerCase();
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey)!;

  const query = state ? `${city}, ${state}, India` : `${city}, India`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as any;
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const loc = data.results[0].geometry.location as LatLng;
      geocodeCache.set(cacheKey, loc);
      return loc;
    }
  } catch {
    // Non-fatal — fall back to text-search without locationRestriction
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert snake_case Google place type to a readable label */
function humanizeType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Best industry label from a Google types array */
function industryFromTypes(types: string[], fallback: string): string {
  // Prefer the first type that isn't a generic meta-type
  const generic = new Set(['point_of_interest', 'establishment', 'store', 'premise', 'locality', 'sublocality']);
  const primary = types.find(t => !generic.has(t));
  return primary ? humanizeType(primary) : fallback;
}

/** Dummy employee count (Places API doesn't provide this) */
function estimateEmployeeCount(min: number, max: number, index: number): number {
  const step = (max - min) / 4;
  return Math.round(min + step * (index % 5)) || 10;
}

@Injectable()
export class GooglePlacesProvider extends DiscoveryProvider {
  async discover(campaign: Campaign): Promise<Company[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured in environment variables');
    }

    const spec = campaign.searchSpec;
    const minEmp = campaign.minEmployees ?? 0;
    const maxEmp = campaign.maxEmployees ?? 1000;

    // ------------------------------------------------------------------
    // Build request body
    // ------------------------------------------------------------------
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.types,places.userRatingCount',
    };

    // Construct a clean, specific textQuery — never the raw goal
    let textQuery: string;
    let includedType: string | undefined;
    let city = campaign.targetLocation || 'India';
    let state = '';
    let radiusMeters = 20000;

    if (spec) {
      // Use the primary target business description + city for a precise query
      textQuery = `${spec.targetBusinesses[0] || spec.industry} in ${spec.city}`;
      includedType = spec.googlePlaceType !== 'establishment' ? spec.googlePlaceType : undefined;
      city = spec.city;
      state = spec.state;
      radiusMeters = spec.radiusMeters;
    } else {
      // Legacy fallback when no searchSpec (e.g. old test calls)
      textQuery = `${campaign.targetIndustry || 'Business'} in ${campaign.targetLocation || 'India'}`;
    }

    console.log(`[Google Places] textQuery="${textQuery}" includedType="${includedType ?? 'none'}" radius=${radiusMeters}m`);

    // Try to geocode for a locationRestriction (precision boost)
    const coords = await geocodeCity(city, state, apiKey);

    const body: Record<string, any> = {
      textQuery,
      languageCode: 'en',
    };

    if (includedType) {
      body.includedType = includedType;
    }

    if (coords) {
      body.locationRestriction = {
        circle: {
          center: { latitude: coords.lat, longitude: coords.lng },
          radius: radiusMeters,
        },
      };
      console.log(`[Google Places] locationRestriction: ${JSON.stringify(coords)} radius=${radiusMeters}m`);
    } else {
      console.warn(`[Google Places] Could not geocode "${city}". Falling back to text-only search.`);
    }

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Places API error: status ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as { places?: any[] };
    if (!data.places || data.places.length === 0) {
      // If the first query with includedType returns empty, retry without it
      if (includedType) {
        console.warn(`[Google Places] No results with includedType="${includedType}". Retrying without type filter.`);
        return this.discoverWithoutTypeFilter(campaign, textQuery, coords, radiusMeters, apiKey, headers, minEmp, maxEmp);
      }
      return [];
    }

    return this.mapPlacesToCompanies(data.places, campaign, minEmp, maxEmp);
  }

  // --------------------------------------------------------------------------
  // Fallback: retry without includedType when strict filter returns 0 results
  // --------------------------------------------------------------------------
  private async discoverWithoutTypeFilter(
    campaign: Campaign,
    textQuery: string,
    coords: LatLng | null,
    radiusMeters: number,
    apiKey: string,
    headers: Record<string, string>,
    minEmp: number,
    maxEmp: number,
  ): Promise<Company[]> {
    const body: Record<string, any> = { textQuery, languageCode: 'en' };
    if (coords) {
      body.locationRestriction = {
        circle: { center: { latitude: coords.lat, longitude: coords.lng }, radius: radiusMeters },
      };
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { places?: any[] };
    if (!data.places) return [];
    return this.mapPlacesToCompanies(data.places, campaign, minEmp, maxEmp);
  }

  // --------------------------------------------------------------------------
  // Map raw Google Places response → Company[]
  // --------------------------------------------------------------------------
  private mapPlacesToCompanies(
    places: any[],
    campaign: Campaign,
    minEmp: number,
    maxEmp: number,
  ): Company[] {
    const specIndustry = campaign.searchSpec?.industry || campaign.targetIndustry || 'Business';
    const location = campaign.searchSpec?.city || campaign.targetLocation || 'India';

    return places.map((place, index) => {
      const name    = place.displayName?.text || 'Unknown Business';
      const address = place.formattedAddress || null;
      const placeId = place.id || null;
      const website = place.websiteUri || null;
      const phone   = place.nationalPhoneNumber || null;
      const rating  = typeof place.rating === 'number' ? place.rating : null;
      const types: string[] = Array.isArray(place.types) ? place.types : [];

      // Use actual Google types for industry — NOT the campaign's targetIndustry
      const industry = industryFromTypes(types, specIndustry);

      return {
        id:            placeId || `google-${index}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        location,
        industry,          // ← FIX: real Google category, not a copy of campaign.targetIndustry
        employeeCount: estimateEmployeeCount(minEmp, maxEmp, index),
        address,
        placeId,
        website,
        phone,
        rating,
        categories:    types.length > 0 ? types : null,   // ← raw types for Validator
        source:        'google_places',
        confidence:    0.9,
      } satisfies import('../../shared/models.js').Company;
    });
  }
}
