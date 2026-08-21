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

const parseRateLimitCount = (value: unknown): number => {
  const count = Number(value ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Invalid rate limit count");
  }

  return count;
};

const evaluateRateLimit = (count: number, max: number, shouldLog = false): boolean => {
  const isRateLimited = count > max;
  // Only log on the first request over the limit to avoid spamming the logs.
  if (shouldLog && count === max + 1) {
    logMessage.warn(`Address Complete: User has been rate limited (${count}/${max} requests)`);
  }

  return isRateLimited;
};

export const isRateLimited = async (ip: string): Promise<boolean> => {
  try {
    const max = await loadSetting(RATE_LIMIT_MAX_SETTING);
    const redis = await getRedisInstance();
    const count = parseRateLimitCount(await redis.get(`${RATE_LIMIT_KEY_PREFIX}:${ip}`));

    return evaluateRateLimit(count, max);
  } catch (err) {
    logMessage.error(
      `AddressComplete rate limit check failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
};

export const recordAndCheckRateLimit = async (ip: string): Promise<boolean> => {
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

    const [incrError, incrCount] = results?.[0] ?? [];
    if (incrError) {
      throw new Error(incrError instanceof Error ? incrError.message : String(incrError));
    }

    const [expireError, expireResult] = results?.[1] ?? [];
    // Cleanup the key if the expire command fails to avoid leaving a key that never expires
    if (expireError || expireResult !== 1) {
      await redis.del(key);
      throw new Error(
        expireError instanceof Error
          ? expireError.message
          : String(expireError ?? `Unexpected expiry result: ${expireResult}`)
      );
    }

    const count = parseRateLimitCount(incrCount);
    return evaluateRateLimit(count, max, true);
  } catch (err) {
    logMessage.error(
      `AddressComplete rate limiting failed. Reason: ${err instanceof Error ? err.message : String(err)}`
    );
    // Redis is probably down, so pass through to avoid breaking the form UX.
    return false;
  }
};
