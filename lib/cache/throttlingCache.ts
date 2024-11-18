"use server";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";
import { getWeeksInSeconds } from "@lib/utils/date/dateConversions";

const REDIS_RATE_LIMIT_KEY_PREFIX: string = "rate-limit";

// future settings will probably be low and medium
const THROTTLE_SETTING = {
  high: "high",
} as const;
export type ThrottleSetting = keyof typeof THROTTLE_SETTING; // For completeness, even though not currently used

export const getThrottling = async (
  formId: string
): Promise<{ rate: string | null; expires: number }> => {
  const getParameter = `${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`;
  try {
    const redis = await getRedisInstance();
    const value = await redis.get(getParameter);
    const expires = await redis.ttl(getParameter);
    return { rate: value, expires };
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

// Increases the throttling rate for a limited duration by leveraging the Redis built-in expiration
// feature by setting an expiryDelay
export const setThrottlingExpiry = async (formId: string, weeks: number) => {
  const modifyParameter = `${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`;
  try {
    const redis = await getRedisInstance();
    const weeksInSeconds = getWeeksInSeconds(weeks);
    const expiresDateInSeconds = Date.now() + weeksInSeconds;
    logMessage.info(
      `Scheduling throttling for ${formId} for ${weeks} weeks and expires on ${new Date(
        expiresDateInSeconds
      )}`
    );
    await redis.setex(modifyParameter, expiresDateInSeconds, THROTTLE_SETTING.high);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

// Permanently increases the throttling rate (uses high capacity token bucket)
export const setPermanentThrottling = async (formId: string) => {
  const modifyParameter = `${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`;
  try {
    const redis = await getRedisInstance();
    logMessage.info(`Permanent throttling for ${formId}`);
    await redis.set(modifyParameter, THROTTLE_SETTING.high);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

// Goes back to the initial throttling rate (uses low capacity token bucket)
export const resetThrottling = async (formId: string) => {
  const modifyParameter = `${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`;
  try {
    const redis = await getRedisInstance();
    logMessage.info(`Removing throttling for ${formId}`);
    await redis.del(modifyParameter);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
