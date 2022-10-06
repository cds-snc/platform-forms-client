import { logMessage } from "@lib/logger";
import { getRedisInstance } from "./integration/redisConnector";
import { Permission } from "./policyBuilder";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean =
  process.env.APP_ENV !== "test" && process.env.REDIS_URL ? true : false;

// Return a random number between 300 and 600  (5 - 10 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 300 + 300);

const checkValue = async (checkParameter: string) => {
  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        logMessage.debug(`Using Cached Privileges for ${checkParameter}`);
        return JSON.parse(value);
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

const deleteValue = async (deleteParameter: string) => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    redis.del(deleteParameter);
    logMessage.debug(`Deleting Cached Privileges  for ${deleteParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

const modifyValue = async (modifyParameter: string, rules: Permission[]) => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    redis.setex(modifyParameter, randomCacheExpiry(), JSON.stringify(rules));
    logMessage.debug(`Updating Cached Privileges for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

/*
  Priveleges
*/

export const privelegeCheck = async (userID: string): Promise<Permission[] | null> => {
  return checkValue(`auth:priveleges:${userID}`);
};

export const privelegeDelete = async (userID: string): Promise<void> => {
  return deleteValue(`auth:priveleges:${userID}`);
};

export const privelegePut = async (userID: string, priveleges: Permission[]): Promise<void> => {
  return modifyValue(`auth:priveleges:${userID}`, priveleges);
};

export const flushValues = async () => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();
    const stream = redis.scanStream({
      match: "auth:priveleges:*",
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
        logMessage.debug("Cached Priveleges have been cleared");
        resolve();
      })
    );
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
