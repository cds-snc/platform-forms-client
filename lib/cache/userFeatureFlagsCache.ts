import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Return a random number between 300 and 600  (5 - 10 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 300 + 300);

export const featureFlagsCheck = async (userID: string): Promise<string[] | null> => {
  const checkParameter = `auth:featureFlags:${userID}`;

  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        return JSON.parse(value);
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

export const featureFlagsPut = async (userID: string, flags: string[]): Promise<void> => {
  const modifyParameter = `auth:featureFlags:${userID}`;

  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), JSON.stringify(flags));
    logMessage.debug(`Updating Cached Feature Flags for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
