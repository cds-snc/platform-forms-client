import { PublicFormRecord } from "@lib/types";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Return a random number between 30 and 60
const randomCacheExpiry = () => Math.floor(Math.random() * 30 + 30);

const checkValue = async (checkParameter: string) => {
  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        logMessage.debug(`Using Cached value for ${checkParameter}`);
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

    await redis.del(deleteParameter);
    logMessage.debug(`Deleting Cached value for ${deleteParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

const modifyValue = async (modifyParameter: string, template: PublicFormRecord | string[]) => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), JSON.stringify(template));
    logMessage.debug(`Updating Cached value for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

/*
  Forms
*/

const formIDCheck = async (formID: string): Promise<PublicFormRecord | null> => {
  return checkValue(`form:config:${formID}`);
};

const formIDDelete = async (formID: string): Promise<void> => {
  return deleteValue(`form:config:${formID}`);
};

const formIDPut = async (formID: string, template: PublicFormRecord): Promise<void> => {
  return modifyValue(`form:config:${formID}`, template);
};

export const formCache = {
  cacheAvailable,
  check: formIDCheck,
  set: formIDPut,
  invalidate: formIDDelete,
};
