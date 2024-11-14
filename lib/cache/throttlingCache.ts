"use server";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";
import { getWeeksInSeconds } from "@lib/utils/date/dateConversions";

export const getThrottling = async (
  formId: string
): Promise<{ rate: string | null; expires: number }> => {
  const getParameter = `rate-limit:${formId}`;
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
export const scheduledThrottling = async (formId: string, weeks: number) => {
  const modifyParameter = `rate-limit:${formId}`;
  try {
    const redis = await getRedisInstance();
    const weeksInSeconds = getWeeksInSeconds(weeks);
    const expiresDateInSeconds = Date.now() + weeksInSeconds;
    logMessage.info(
      `Scheduling throttling for ${formId} for ${weeks} weeks and expires on ${new Date(
        expiresDateInSeconds
      )}`
    );
    await redis.setex(modifyParameter, expiresDateInSeconds, "high");
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

// Permanently increases the throttling rate (uses high capacity token bucket)
export const permanentThrottling = async (formId: string) => {
  const modifyParameter = `rate-limit:${formId}`;
  try {
    const redis = await getRedisInstance();
    logMessage.info(`Permanent throttling for ${formId}`);
    await redis.set(modifyParameter, "high");
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

// Goes back to the initial throttling rate (uses low capacity token bucket)
export const resetThrottling = async (formId: string) => {
  const modifyParameter = `rate-limit:${formId}`;
  try {
    const redis = await getRedisInstance();
    logMessage.info(`Removing throttling for ${formId}`);
    await redis.del(modifyParameter);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
