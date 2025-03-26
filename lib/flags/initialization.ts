import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";
import initialFlags from "./default_flag_settings.json";

const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

const checkAll = async () => {
  const redis = await getRedisInstance();
  const keys = await redis.smembers("flags");
  return checkMulti(keys);
};

const checkMulti = async (keys: string[]) => {
  const redis = await getRedisInstance();
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map());

  return Object.fromEntries(mapped);
};

const removeFlag = async (key: string) => {
  const redis = await getRedisInstance();
  await redis.srem("flags", key);
  await redis.del(`flag:${key}`);
};

const createFlag = async (key: string, value: boolean) => {
  const redis = await getRedisInstance();
  await redis
    .multi()
    .sadd("flags", key)
    .set(`flag:${key}`, value ? "1" : "0")
    .exec();
};
export const initiateFlags = async () => {
  logMessage.info("Running flag initiation");
  if (!cacheAvailable) {
    process.env.APP_ENV !== "test" &&
      logMessage.info("Application is TEST mode, skipping flag initiation");
    Boolean(process.env.REDIS_URL) ??
      logMessage.info("No REDIS_URL environment variable found, skipping flag initiation");
  }
  const redis = await getRedisInstance();

  try {
    let currentFlags = await checkAll();
    const defaultFlags: { [key: string]: boolean } = initialFlags;
    logMessage.info("Checking for Depreceated Flags");
    const removeFlags = [];
    for (const key in currentFlags) {
      if (typeof defaultFlags[key] === "undefined" || defaultFlags[key] === null) {
        removeFlags.push(
          (() => {
            logMessage.info(`Removing flag: ${key} from flag registry`);
            return removeFlag(key);
          })()
        );
      }
    }
    await Promise.all(removeFlags);

    currentFlags = await checkAll();
    logMessage.info("Checking for New Flags");
    const addFlags = [];
    for (const key in initialFlags) {
      if (typeof currentFlags[key] === "undefined" || currentFlags[key] === null) {
        addFlags.push(
          (async () => {
            logMessage.info(`Creating flag: ${key} with value ${defaultFlags[key]}`);
            return createFlag(key, defaultFlags[key]);
          })()
        );
      }
    }
    return await Promise.all(addFlags);
  } catch (err) {
    logMessage.error(err);
  } finally {
    redis.disconnect();
  }
};
