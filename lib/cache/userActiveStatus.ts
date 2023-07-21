import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Return a random number between 300 and 600  (5 - 10 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 300 + 300);

export const activeStatusCheck = async (userID: string): Promise<boolean | null> => {
  const checkParameter = `auth:active:${userID}`;

  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        logMessage.debug(`Using Cached User Status for ${checkParameter}`);
        return value === "1";
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

export const activeStatusUpdate = async (userID: string, status: boolean): Promise<void> => {
  const modifyParameter = `auth:active:${userID}`;

  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), status ? "1" : "0");
    logMessage.debug(`Updating Cached User Status for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
