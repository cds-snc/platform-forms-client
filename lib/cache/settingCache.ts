import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Return a random number between 30 and 60  (30 seconds <-> 1 minute)
const randomCacheExpiry = () => Math.floor(Math.random() * 30 + 30);

export const settingCheck = async (internalId: string): Promise<string | null> => {
  const checkParameter = `setting:${internalId}`;

  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        logMessage.debug(`Using Cached Setting for ${checkParameter}`);
        return value;
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

export const settingDelete = async (internalId: string): Promise<void> => {
  const deleteParameter = `setting:${internalId}`;

  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    await redis.del(deleteParameter);
    logMessage.debug(`Deleting Cached Setting for ${deleteParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

export const settingPut = async (internalId: string, value: string): Promise<void> => {
  const modifyParameter = `setting:${internalId}`;

  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), value);
    logMessage.debug(`Updating Cached Setting for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

export const flushSettings = async () => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();
    const stream = redis.scanStream({
      match: "setting:*",
    });
    stream.on("data", function (keys: string[]) {
      // `keys` is an array of strings representing key names
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach(function (key: string) {
          pipeline.del(key);
        });
        pipeline.exec();
      }
    });
    return new Promise<void>((resolve) =>
      stream.on("end", () => {
        logMessage.debug("Cached Settings have been cleared");
        resolve();
      })
    );
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
