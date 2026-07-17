import { Injectable } from '@nitrostack/core';
import { DiscoveryProvider } from './providers/discovery.provider.js';
import { GooglePlacesProvider } from './providers/google-places.provider.js';
import { MockProvider } from './providers/mock.provider.js';
import { Campaign, Company } from '../shared/models.js';
import { LIVE_MODE, sessionCounters, SESSION_LIMITS, googlePlacesRateLimiter, executeWithRetry } from '../../core/ai/api-protection.js';

@Injectable()
export class DiscoveryService {
  // In-memory cache
  private cache = new Map<string, { data: Company[]; expiry: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private readonly googleProvider: GooglePlacesProvider,
    private readonly mockProvider: MockProvider
  ) {}

  async discover(campaign: Campaign): Promise<Company[]> {
    const industry = campaign.targetIndustry || 'SaaS';
    const location = campaign.targetLocation || 'Bangalore';
    const minEmp = campaign.minEmployees ?? 0;
    const maxEmp = campaign.maxEmployees ?? 1000;

    // Include searchSpec product in cache key so different products in same location don't collide
    const product = campaign.searchSpec?.product?.toLowerCase() || 'generic';
    const cacheKey = `${product}_${industry.toLowerCase()}_${location.toLowerCase()}_${minEmp}-${maxEmp}`;
    const now = Date.now();

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > now) {
      console.log(`[Google Places] [Cache Hit] Returning cached companies for query: ${cacheKey}`);
      return cached.data;
    }

    // 2. If LIVE_MODE is false, ALWAYS use MockProvider directly
    if (!LIVE_MODE) {
      console.log(`[Google Places] [Cache Miss] (Mock) [LIVE_MODE=false] Fetching mock results.`);
      const companies = await this.mockProvider.discover(campaign);
      this.cache.set(cacheKey, {
        data: companies,
        expiry: now + this.CACHE_TTL,
      });
      return companies;
    }

    // 3. Check Session Safety Limit
    if (sessionCounters.googlePlaces >= SESSION_LIMITS.googlePlaces) {
      console.warn(`[Discovery Warning] Google Places session limit reached (${sessionCounters.googlePlaces}/${SESSION_LIMITS.googlePlaces}). Falling back to MockProvider.`);
      const companies = await this.mockProvider.discover(campaign);
      this.cache.set(cacheKey, {
        data: companies,
        expiry: now + this.CACHE_TTL,
      });
      return companies;
    }

    console.log(`[Google Places] [Cache Miss] Querying provider for query: ${cacheKey}`);
    const startTime = Date.now();
    let companies: Company[] = [];

    // 4. Call Google Provider, fallback to Mock if fails or empty
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error('GOOGLE_MAPS_API_KEY environment variable is not defined');
      }

      // Increment request counter
      sessionCounters.googlePlaces++;
      const currentRequestNum = sessionCounters.googlePlaces;

      // Rate limit and retry execution
      companies = await googlePlacesRateLimiter.enqueue(async () => {
        return await executeWithRetry(async () => {
          return await this.googleProvider.discover(campaign);
        }, 'Google Places');
      });

      const duration = Date.now() - startTime;
      console.log(`[Google Places] [Cache Miss] [Request #${currentRequestNum}] [Duration: ${duration} ms] [Session Count: ${currentRequestNum}]`);
      
      if (companies.length === 0) {
        console.warn(`[Google Places] Returned empty results. Falling back to MockProvider.`);
        companies = await this.mockProvider.discover(campaign);
      }
    } catch (error: any) {
      console.error(`[Discovery Error] Google Places Provider failed: ${error.message}. Falling back to MockProvider.`);
      companies = await this.mockProvider.discover(campaign);
    }

    // Apply reject-keyword filter (deterministic, zero API calls)
    const rejectKeywords = campaign.searchSpec?.rejectKeywords ?? [];
    if (rejectKeywords.length > 0) {
      const before = companies.length;
      companies = companies.filter(c => {
        const nameLower = c.name.toLowerCase();
        const rejected = rejectKeywords.some(kw => nameLower.includes(kw.toLowerCase()));
        if (rejected) {
          console.log(`[Discovery] Rejected by keyword filter: "${c.name}" (matched reject keyword)`);
        }
        return !rejected;
      });
      if (companies.length < before) {
        console.log(`[Discovery] Keyword filter removed ${before - companies.length} companies. Remaining: ${companies.length}`);
      }
    }

    // Slice to maximum of 10 companies
    const slicedCompanies = companies.slice(0, 10);

    // 5. Cache the result
    this.cache.set(cacheKey, {
      data: slicedCompanies,
      expiry: now + this.CACHE_TTL,
    });

    return slicedCompanies;
  }
}
