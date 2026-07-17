import { Injectable } from '@nitrostack/core';
import { Company, ResearchResult, QualificationScore, Campaign } from '../shared/models.js';
import { LLMQualificationProvider } from './providers/llm.provider.js';
import { HeuristicProvider } from './providers/heuristic.provider.js';
import { LIVE_MODE, sessionCounters, SESSION_LIMITS, geminiRateLimiter, executeWithRetry } from '../../core/ai/api-protection.js';

@Injectable()
export class QualificationService {
  // In-memory cache
  private cache = new Map<string, { data: QualificationScore; expiry: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private readonly llmProvider: LLMQualificationProvider,
    private readonly heuristicProvider: HeuristicProvider
  ) {}

  async qualify(company: Company, research: ResearchResult, campaign: Campaign): Promise<QualificationScore> {
    const startTime = Date.now();

    const researchTime = research.normalized?.timestamp?.value || new Date().toISOString();
    const cacheKey = `${campaign.id}_${company.id}_${researchTime}`;

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Gemini Qualification] [Cache Hit] Returning cached qualification for key: ${cacheKey}`);
      return cached.data;
    }

    // 2. If LIVE_MODE is false, ALWAYS use HeuristicProvider directly
    if (!LIVE_MODE) {
      console.log(`[Gemini Qualification] [Cache Miss] (Mock) [LIVE_MODE=false] Fetching heuristic qualification.`);
      const result = await this.heuristicProvider.qualify(company, research, campaign);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    // 3. Check Session Safety Limit
    if (sessionCounters.gemini >= SESSION_LIMITS.gemini) {
      console.warn(`[Gemini Warning] Gemini session limit reached (${sessionCounters.gemini}/${SESSION_LIMITS.gemini}). Falling back to HeuristicProvider.`);
      const result = await this.heuristicProvider.qualify(company, research, campaign);
      this.cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });
      return result;
    }

    console.log(`[Gemini Qualification] [Cache Miss] Qualifying company: ${company.name} (ID: ${company.id})`);
    let scoreResult: QualificationScore;
    let providerUsed = 'llm';

    // 4. Call LLM Provider, fallback to Heuristic if fails
    try {
      // Increment request counter
      sessionCounters.gemini++;
      const currentRequestNum = sessionCounters.gemini;

      // Rate limit and retry execution
      scoreResult = await geminiRateLimiter.enqueue(async () => {
        return await executeWithRetry(async () => {
          return await this.llmProvider.qualify(company, research, campaign);
        }, 'Gemini Qualification');
      });

      const duration = Date.now() - startTime;
      console.log(`[Gemini Qualification] [Cache Miss] [Request #${currentRequestNum}] [Duration: ${duration} ms] [Session Count: ${currentRequestNum}]`);
    } catch (error: any) {
      console.warn(`[Gemini Qualification Failure] LLMQualificationProvider failed: ${error.message}. Falling back to HeuristicProvider.`);
      providerUsed = 'heuristic';
      scoreResult = await this.heuristicProvider.qualify(company, research, campaign);
    }

    // 5. Cache the result
    this.cache.set(cacheKey, {
      data: scoreResult,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return scoreResult;
  }
}
