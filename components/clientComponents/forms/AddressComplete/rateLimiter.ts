import "server-only";

import { logMessage } from "@lib/logger";
import { getAppSetting } from "@root/lib/appSettings";
import { getRedisInstance } from "@root/lib/integration/redisConnector";
import { isPositiveSafeInteger } from "./utils";

const RATE_LIMIT_KEY_PREFIX = "address-complete:rate-limit";
const RATE_LIMIT_MAX_SETTING = "addressCompleteRetrieveRateLimitMax";
const RATE_LIMIT_WINDOW_SETTING = "addressCompleteRateLimitWindowSeconds";

const loadSetting = async (key: string): Promise<number> => {
  const value = Number(await getAppSetting(key));
  if (!isPositiveSafeInteger(value)) {
    throw new Error("Invalid configuration");
  }

  return value;
};

const evaluateRateLimit = (count: number, max: number, shouldLog = false): boolean => {
  const isRateLimited = count > max;
  // Only log on the first request over the limit to avoid spamming the logs.
  if (shouldLog && count === max + 1) {
    logMessage.warn(`Address Complete: User has been rate limited (${count}/${max} requests)`);
  }

  return isRateLimited;
};

export const checkRateLimited = async (ip: string): Promise<boolean> => {
  try {
    const max = await loadSetting(RATE_LIMIT_MAX_SETTING);
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

export const incrementAndCheckRateLimiting = async (ip: string): Promise<boolean> => {
  try {
    const [max, windowSeconds] = await Promise.all([
      loadSetting(RATE_LIMIT_MAX_SETTING),
      loadSetting(RATE_LIMIT_WINDOW_SETTING),
    ]);
    const redis = await getRedisInstance();
    const key = `${RATE_LIMIT_KEY_PREFIX}:${ip}`;

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    const results = await pipeline.exec();

    // If incrementing fails ([error, value] tuple), fail open to avoid breaking the form UX.
    const [incrError, incrCount] = results?.[0] ?? [];
    if (incrError) {
      return false;
    }

    const count = Number(incrCount ?? 0);
    return evaluateRateLimit(count, max, true);
  } catch (err) {
    logMessage.error(
      `AddressComplete rate limiting failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    // Redis is probably down, so pass through to avoid breaking the form UX.
    return false;
  }
};
