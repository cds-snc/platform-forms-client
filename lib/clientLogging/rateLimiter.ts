import { getRedisInstance } from "@lib/integration/redisConnector";

// TODO is there code we can reuse or a library for this? (e.g. https://www.npmjs.com/package/rate-limiter-flexible)
// Or perrhaps this is good as is.

const KEY_PREFIX = "client-log:rl";
const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 30;

/**
 * Fixed-window of time rate limiter keyed by IP address.
 * Returns true if the request is within the allowed rate, false if it should be rejected
 * Fails when Redis is unavailable so logging is never blocked by infrastructure issues
 */
export async function checkClientLogRateLimit(ip: string): Promise<boolean> {
  try {
    const redis = await getRedisInstance();
    const window = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
    const key = `${KEY_PREFIX}:${ip}:${window}`;

    const count = await redis.incr(key);

    if (count === 1) {
      // Set TTL on first write - 2x window gives the key time to expire after the next window try
      await redis.expire(key, WINDOW_SECONDS * 2);
    }

    return count <= MAX_REQUESTS_PER_WINDOW;
  } catch {
    // Fails but logging should not break when Redis is unavailable
    return true;
  }
}
