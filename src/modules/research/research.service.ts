import { Injectable } from '@nitrostack/core';
import { ResearchProvider } from './providers/research.provider.js';
import { TavilyProvider } from './providers/tavily.provider.js';
import { MockProvider } from './providers/mock.provider.js';
import { Company, ResearchResult } from '../shared/models.js';
import { LIVE_MODE, sessionCounters, SESSION_LIMITS, tavilyRateLimiter, executeWithRetry } from '../../core/ai/api-protection.js';

@Injectable()
export class ResearchService {
  // In-memory cache
  private cache = new Map<string, { data: ResearchResult; expiry: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private readonly tavilyProvider: TavilyProvider,
    private readonly mockProvider: MockProvider
  ) {}

  async research(company: Company): Promise<ResearchResult> {
    const startTime = Date.now();

    // 1. Check Cache
    const cached = this.cache.get(company.id);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Tavily] [Cache Hit] Returning cached research for company: ${company.name} (ID: ${company.id})`);
      return cached.data;
    }

    // 2. If LIVE_MODE is false, ALWAYS use MockProvider directly
    if (!LIVE_MODE) {
      console.log(`[Tavily] [Cache Miss] (Mock) [LIVE_MODE=false] Fetching mock research.`);
      const result = await this.mockProvider.research(company);
      this.cache.set(company.id, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    // 3. Check Session Safety Limit
    if (sessionCounters.tavily >= SESSION_LIMITS.tavily) {
      console.warn(`[Tavily Warning] Tavily session limit reached (${sessionCounters.tavily}/${SESSION_LIMITS.tavily}). Falling back to MockProvider.`);
      const result = await this.mockProvider.research(company);
      this.cache.set(company.id, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    console.log(`[Tavily] [Cache Miss] Fetching fresh research for: ${company.name}`);
    let result: ResearchResult;

    // 4. Call Tavily Provider, fallback to Mock if fails
    try {
      if (!process.env.TAVILY_API_KEY) {
        throw new Error('TAVILY_API_KEY environment variable is not defined');
      }

      // Increment request counter
      sessionCounters.tavily++;
      const currentRequestNum = sessionCounters.tavily;

      // Rate limit and retry execution
      result = await tavilyRateLimiter.enqueue(async () => {
        return await executeWithRetry(async () => {
          return await this.tavilyProvider.research(company);
        }, 'Tavily');
      });

      const duration = Date.now() - startTime;
      console.log(`[Tavily] [Cache Miss] [Request #${currentRequestNum}] [Duration: ${duration} ms] [Session Count: ${currentRequestNum}]`);
    } catch (error: any) {
      console.warn(`[Tavily Failure] Tavily Provider failed: ${error.message}. Falling back to MockProvider.`);
      result = await this.mockProvider.research(company);
    }

    // 5. Cache the result
    this.cache.set(company.id, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return result;
  }
}
