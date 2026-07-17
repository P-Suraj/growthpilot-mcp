import 'dotenv/config';

export const LIVE_MODE = process.env.LIVE_MODE === 'true';

// Session request counters
export const sessionCounters = {
  googlePlaces: 0,
  tavily: 0,
  gemini: 0,
};

// Session limits
export const SESSION_LIMITS = {
  googlePlaces: 20,
  tavily: 50,
  gemini: 100,
};

// Rate limiter queues (ensuring delay between consecutive calls)
class RateLimiterQueue {
  private lastCallTime = 0;
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  constructor(private readonly minIntervalMs: number) {}

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      const waitTime = Math.max(0, this.minIntervalMs - timeSinceLastCall);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastCallTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

export const googlePlacesRateLimiter = new RateLimiterQueue(3000); // 1 request / 3s
export const tavilyRateLimiter = new RateLimiterQueue(2000);       // 1 request / 2s
export const geminiRateLimiter = new RateLimiterQueue(2000);       // 1 request / 2s

/**
 * Executes a function with a retry limit and exponential backoff.
 */
export async function executeWithRetry<T>(
  task: () => Promise<T>,
  providerName: string,
  maxRetries = 2,
  baseDelayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (error: any) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Retry Warning] ${providerName} failed: ${error.message}. Retrying in ${delay}ms (Attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
