/**
 * In-memory rate limiter.
 * Stores per-IP request counts with a sliding window.
 * NOTE: Resets on server restart. Suitable for single-instance Next.js.
 * For multi-instance/serverless, switch to Redis (Upstash).
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Map: key (e.g. "ip:action") → rate limit state
const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes to avoid memory leaks
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Remove entries whose window expired > 2 windows ago
    if (now - entry.windowStart > CLEANUP_INTERVAL_MS) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (ms) when the window resets
}

/**
 * Check and increment rate limit for a given key.
 * @param key       Unique string key, e.g. `${ip}:inquiry` or `${ip}:login`
 * @param limit     Max allowed requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window: first request is always allowed
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}
