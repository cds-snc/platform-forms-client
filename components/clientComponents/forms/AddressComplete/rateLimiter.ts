import "server-only";

import { logMessage } from "@lib/logger";
import { getAppSetting } from "@root/lib/appSettings";
import { getRedisInstance } from "@root/lib/integration/redisConnector";
import { isPositiveSafeInteger } from "./utils";

const RATE_LIMIT_KEY_PREFIX = "address-complete:rate-limit";
const RATE_LIMIT_MAX_SETTING = "addressCompleteRetrieveRateLimitMax";
const RATE_LIMIT_WINDOW_SETTING = "addressCompleteRateLimitWindowSeconds";

const getRateLimitMax = async (): Promise<number> => {
  const max = Number(await getAppSetting(RATE_LIMIT_MAX_SETTING));
  if (!isPositiveSafeInteger(max)) {
    throw new Error("Invalid configuration");
  }

  return max;
};

const getRateLimitWindowSeconds = async (): Promise<number> => {
  const windowSeconds = Number(await getAppSetting(RATE_LIMIT_WINDOW_SETTING));
  if (!isPositiveSafeInteger(windowSeconds)) {
    throw new Error("Invalid configuration");
  }

  return windowSeconds;
};

const evaluateRateLimit = (count: number, max: number, shouldLog = false): boolean => {
  const isRateLimited = count > max;
  // Only log the first time a user is rate limited to avoid spamming the logs.
  if (shouldLog && count === max + 1) {
    logMessage.warn(`AddressComplete user has been rate limited.`);
  }

  return isRateLimited;
};

export const checkRateLimited = async (ip: string): Promise<boolean> => {
  try {
    const max = await getRateLimitMax();
    const redis = await getRedisInstance();
    const count = Number((await redis.get(`${RATE_LIMIT_KEY_PREFIX}:${ip}`)) ?? 0);

    return evaluateRateLimit(count, max);
  } catch (err) {
    logMessage.error(
      `AddressComplete rate limit check failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
};

// Handles the rate limit for paid Retrieve requests and checks whether the user is rate limited.
export const incrementAndCheckRateLimiting = async (ip: string): Promise<boolean> => {
  try {
    const [max, windowSeconds] = await Promise.all([
      getRateLimitMax(),
      getRateLimitWindowSeconds(),
    ]);
    const redis = await getRedisInstance();
    const key = `${RATE_LIMIT_KEY_PREFIX}:${ip}`;

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    const results = await pipeline.exec();

    // If incrementing fails, fail open to avoid breaking the form UX.
    const incrResult = results?.[0];
    if (incrResult?.[0]) {
      return false;
    }

    const count = Number(incrResult?.[1] ?? 0);
    return evaluateRateLimit(count, max, true);
  } catch (err) {
    logMessage.error(
      `AddressComplete rate limiting failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    // Redis is probably down, so pass through to avoid breaking the form UX.
    return false;
  }
};
