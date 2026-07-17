import { Injectable } from '@nitrostack/core';
import { Draft, Critique } from '../shared/models.js';
import { LLMCriticProvider } from './providers/llm.provider.js';
import { MockCriticProvider } from './providers/mock.provider.js';
import { LIVE_MODE, sessionCounters, SESSION_LIMITS, geminiRateLimiter, executeWithRetry } from '../../core/ai/api-protection.js';

@Injectable()
export class CriticService {
  // In-memory cache
  private cache = new Map<string, { data: Critique; expiry: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private readonly llmProvider: LLMCriticProvider,
    private readonly mockProvider: MockCriticProvider
  ) {}

  async critique(draft: Draft, campaignId?: string, researchTime?: string): Promise<Critique> {
    const timeKey = researchTime || new Date().toISOString();
    const cacheKey = `${campaignId || 'default'}_${draft.companyId}_${timeKey}`;

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Gemini Critic] [Cache Hit] Returning cached critique for draft: ${draft.companyId}`);
      return cached.data;
    }

    // 2. If LIVE_MODE is false, ALWAYS use MockCriticProvider directly
    if (!LIVE_MODE) {
      console.log(`[Gemini Critic] [Cache Miss] (Mock) [LIVE_MODE=false] Fetching mock critique.`);
      const result = await this.mockProvider.critique(draft);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    // 3. Check Session Safety Limit
    if (sessionCounters.gemini >= SESSION_LIMITS.gemini) {
      console.warn(`[Gemini Warning] Gemini session limit reached (${sessionCounters.gemini}/${SESSION_LIMITS.gemini}). Falling back to MockCriticProvider.`);
      const result = await this.mockProvider.critique(draft);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    console.log(`[Gemini Critic] [Cache Miss] Analyzing draft for company ID: ${draft.companyId}`);
    const startTime = Date.now();
    let result: Critique;

    // 4. Call LLM Provider, fallback to Mock if fails
    try {
      // Increment request counter
      sessionCounters.gemini++;
      const currentRequestNum = sessionCounters.gemini;

      // Rate limit and retry execution
      result = await geminiRateLimiter.enqueue(async () => {
        return await executeWithRetry(async () => {
          return await this.llmProvider.critique(draft);
        }, 'Gemini Critic');
      });

      const duration = Date.now() - startTime;
      console.log(`[Gemini Critic] [Cache Miss] [Request #${currentRequestNum}] [Duration: ${duration} ms] [Session Count: ${currentRequestNum}]`);
    } catch (error: any) {
      console.warn(`[Gemini Critic Failure] LLMCriticProvider failed: ${error.message}. Falling back to MockCriticProvider.`);
      result = await this.mockProvider.critique(draft);
    }

    // 5. Cache the result
    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return result;
  }

  async revise(draft: Draft, critique: Critique): Promise<Draft> {
    // Revisions run locally or via mock directly as they are part of the Critic-loop logic
    try {
      return await this.llmProvider.revise(draft, critique);
    } catch (error: any) {
      console.warn(`[Critic Service] LLMCriticProvider revision failed: ${error.message}. Falling back to MockCriticProvider.`);
      return await this.mockProvider.revise(draft, critique);
    }
  }
}
