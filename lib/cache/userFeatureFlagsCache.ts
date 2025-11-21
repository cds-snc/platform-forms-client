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

export const syncUserFeatureFlagsToRedis = async (
  usersWithFeatures: { userId: string; feature: string }[]
): Promise<void> => {
  if (!cacheAvailable) return;

  try {
    const redis = await getRedisInstance();

    // Group features by userId from usersWithFeatures
    const userFlagsMap: Record<string, Set<string>> = {};
    usersWithFeatures.map(({ userId, feature }) => {
      if (!userFlagsMap[userId]) {
        userFlagsMap[userId] = new Set();
      }
      userFlagsMap[userId].add(feature);
    });

    // Delete any keys not in usersWithFeatures in Redis
    const existingKeys = await redis.keys("auth:featureFlags:*");
    const existingUserIds = existingKeys.map((key) => key.replace("auth:featureFlags:", ""));
    const currentUserIds = Object.keys(userFlagsMap);
    const keysToDelete = existingUserIds.filter((userId) => !currentUserIds.includes(userId));
    await Promise.all(
      keysToDelete.map((userId) => {
        const redisKey = `auth:featureFlags:${userId}`;
        redis.del(redisKey).then();
      })
    );

    // Sync user feature flags (usersWithFeatures) to Redis
    await Promise.all(
      Object.entries(userFlagsMap).map(([userId, features]) => {
        const redisKey = `auth:featureFlags:${userId}`;
        const flagsArray = Array.from(features);
        redis.setex(redisKey, randomCacheExpiry(), JSON.stringify(flagsArray));
      })
    );
  } catch (error) {
    logMessage.error(error as Error);
    throw new Error("Could not connect to cache");
  }
};
