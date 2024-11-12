"use server";

import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// Unit test expected in expected out (e.g. right redis function)

// TODO - what to do for case of permanent?
const getWeeksInSeconds = (weeks: number) => {
  // TODO check that math :)
  return weeks * 60 * 60 * 24 * 7;
};

export const updateThrottling = async (
  formId: string,
  weeks?: number,
  permanent?: boolean
): Promise<void> => {
  const modifyParameter = `rate-limit:${formId}`;
  const permanentParameter = permanent ? "high" : ""; // Potential future values low/medium/high

  try {
    const redis = await getRedisInstance();

    logMessage.info("~~~~~~~~~~updateThrottling", formId, weeks, permanent);

    if (weeks) {
      const expiresInSeconds = getWeeksInSeconds(weeks);
      await redis.setex(modifyParameter, expiresInSeconds, permanentParameter);
      return;
    }

    // Remove rate limiter since permanent
    await redis.del(modifyParameter);
    // await redis.set(modifyParameter, permanentParameter)

    logMessage.debug(`Updating Cached Throttling for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
