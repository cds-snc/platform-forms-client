import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// TODO - what to do for case of permanent?
const getWeeksInSeconds = (weeks: number) => {
  // TODO check that math :)
  return (weeks || 1) * 60 * 60 * 24 * 7;
};

export const updateThrottling = async (
  formId: string,
  weeks: number,
  permanent: boolean
): Promise<void> => {
  const modifyParameter = `rate-limit:${formId}`;
  const permanentParameter = permanent ? "high" : "";

  // TODO - necessary?
  if (!cacheAvailable) return;

  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, getWeeksInSeconds(weeks), permanentParameter);
    logMessage.debug(`Updating Cached Throttling for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
