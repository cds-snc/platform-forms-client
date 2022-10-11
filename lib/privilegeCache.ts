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
  Privileges
*/

export const privilegeCheck = async (userID: string): Promise<Permission[] | null> => {
  return checkValue(`auth:privileges:${userID}`);
};

export const privilegeDelete = async (userID: string): Promise<void> => {
  return deleteValue(`auth:privileges:${userID}`);
};

export const privilegePut = async (userID: string, privileges: Permission[]): Promise<void> => {
  return modifyValue(`auth:privileges:${userID}`, privileges);
};

export const flushValues = async () => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();
    const stream = redis.scanStream({
      match: "auth:privileges:*",
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
        logMessage.debug("Cached Privileges have been cleared");
        resolve();
      })
    );
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
