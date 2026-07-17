import { Injectable } from '@nitrostack/core';
import { Company, ResearchResult, QualificationScore, Draft } from '../shared/models.js';
import { LLMDraftProvider } from './providers/llm.provider.js';
import { MockDraftProvider } from './providers/mock.provider.js';
import { LIVE_MODE, sessionCounters, SESSION_LIMITS, geminiRateLimiter, executeWithRetry } from '../../core/ai/api-protection.js';

@Injectable()
export class DraftService {
  // In-memory cache
  private cache = new Map<string, { data: Draft; expiry: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private readonly llmProvider: LLMDraftProvider,
    private readonly mockProvider: MockDraftProvider
  ) {}

  async generateDraft(
    company: Company,
    research: ResearchResult,
    score: QualificationScore,
    goal: string,
    campaignId?: string
  ): Promise<Draft> {
    const researchTime = research.normalized?.timestamp?.value || new Date().toISOString();
    const cacheKey = `${campaignId || 'default'}_${company.id}_${researchTime}`;

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Gemini Draft] [Cache Hit] Returning cached draft for: ${company.name}`);
      return cached.data;
    }

    // 2. If LIVE_MODE is false, ALWAYS use MockDraftProvider directly
    if (!LIVE_MODE) {
      console.log(`[Gemini Draft] [Cache Miss] (Mock) [LIVE_MODE=false] Fetching mock draft.`);
      const result = await this.mockProvider.generateDraft(company, research, score, goal);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    // 3. Check Session Safety Limit
    if (sessionCounters.gemini >= SESSION_LIMITS.gemini) {
      console.warn(`[Gemini Warning] Gemini session limit reached (${sessionCounters.gemini}/${SESSION_LIMITS.gemini}). Falling back to MockDraftProvider.`);
      const result = await this.mockProvider.generateDraft(company, research, score, goal);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    console.log(`[Gemini Draft] [Cache Miss] Generating fresh draft for: ${company.name}`);
    const startTime = Date.now();
    let result: Draft;

    // 4. Call LLM Provider, fallback to Mock if fails
    try {
      // Increment request counter
      sessionCounters.gemini++;
      const currentRequestNum = sessionCounters.gemini;

      // Rate limit and retry execution
      result = await geminiRateLimiter.enqueue(async () => {
        return await executeWithRetry(async () => {
          return await this.llmProvider.generateDraft(company, research, score, goal);
        }, 'Gemini Draft');
      });

      const duration = Date.now() - startTime;
      console.log(`[Gemini Draft] [Cache Miss] [Request #${currentRequestNum}] [Duration: ${duration} ms] [Session Count: ${currentRequestNum}]`);
    } catch (error: any) {
      console.warn(`[Gemini Draft Failure] LLMDraftProvider failed: ${error.message}. Falling back to MockDraftProvider.`);
      result = await this.mockProvider.generateDraft(company, research, score, goal);
    }

    // 5. Cache the result
    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return result;
  }
}
