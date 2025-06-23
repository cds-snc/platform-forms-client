import { authorization } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Return a random number between 300 and 600  (5 - 10 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 300 + 300);

export const featureFlagsCheck = async (userID: string): Promise<string[] | null> => {
  //const canManage = await authorization.canManageUser(userID);

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
  await authorization.canManageFlags();
  await authorization.canManageUser(userID);

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

// Gets all users that have feature flags set
export const featureFlagsGetAll = async (): Promise<{ userID: string; flag: string }[]> => {
  if (!cacheAvailable) return [];

  try {
    const redis = await getRedisInstance();
    const keys = await redis.keys("auth:featureFlags:*");
    if (keys.length === 0) return [];

    const values = await redis.mget(keys);

    // Flatten each user's flags into separate entries
    const result: { userID: string; flag: string }[] = [];
    keys.forEach((key, idx) => {
      const userID = key.replace("auth:featureFlags:", "");
      const flags = values[idx] ? JSON.parse(values[idx] as string) : [];
      for (const flag of flags) {
        result.push({ userID, flag });
      }
    });
    return result;
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
