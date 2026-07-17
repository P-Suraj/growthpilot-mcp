import { Injectable } from '@nitrostack/core';
import { DiscoveryProvider } from './discovery.provider.js';
import { Campaign, Company } from '../../shared/models.js';

@Injectable()
export class GooglePlacesProvider extends DiscoveryProvider {
  async discover(campaign: Campaign): Promise<Company[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured in environment variables');
    }

    const query = campaign.goal || `${campaign.targetIndustry} in ${campaign.targetLocation}`;
    
    // Places API (New) Text Search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // Field mask tells Google which fields to return. 
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.types',
    };

    const body = JSON.stringify({
      textQuery: query,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Places API error: status ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as { places?: any[] };
    if (!data.places || data.places.length === 0) {
      return [];
    }

    // Map raw Google places to Company model
    const minEmp = campaign.minEmployees ?? 20;
    const maxEmp = campaign.maxEmployees ?? 100;
    const industry = campaign.targetIndustry || 'SaaS';
    const location = campaign.targetLocation || 'Bangalore';

    // Helper to generate a dummy employee count within range since Google Places doesn't return employee counts
    const getEmpCount = (min: number, max: number, index: number) => {
      const step = (max - min) / 4;
      return Math.round(min + step * (index % 5));
    };

    return data.places.map((place, index) => {
      const name = place.displayName?.text || 'Unknown Business';
      const address = place.formattedAddress || null;
      const placeId = place.id || null;
      const website = place.websiteUri || null;
      const phone = place.nationalPhoneNumber || null;
      const rating = typeof place.rating === 'number' ? place.rating : null;
      const categories = Array.isArray(place.types) ? place.types : null;

      return {
        id: placeId || `google-${index}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        location,
        industry,
        employeeCount: getEmpCount(minEmp, maxEmp, index) || 10,
        address,
        placeId,
        website,
        phone,
        rating,
        categories,
        source: 'google_places',
        confidence: 0.9,
      };
    });
  }
}
