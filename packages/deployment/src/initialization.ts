/* eslint-disable no-console */
import Redis from "ioredis";

let redisConnection: Redis | null = null;

export const getRedisInstance = (): Redis => {
  if (!redisConnection) {
    if (!process.env.REDIS_URL) throw new Error("No Redis URL is configured");
    redisConnection = new Redis(process.env.REDIS_URL);
  }
  return redisConnection;
};

// If there is a Redis URL configured instantiate the connection
if (process.env.REDIS_URL) {
  // No need to set the client to the variable, as it is already set in the function
  getRedisInstance();
}

const checkAll = async () => {
  const redis = getRedisInstance();
  const keys = await redis.smembers("flags");
  return checkMulti(keys);
};

const checkMulti = async (keys: string[]) => {
  const redis = getRedisInstance();
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map());

  return Object.fromEntries(mapped);
};

const removeFlag = async (key: string) => {
  const redis = getRedisInstance();
  await redis.srem("flags", key);
  await redis.del(`flag:${key}`);
};

const createFlag = async (key: string, value: boolean) => {
  const redis = getRedisInstance();
  await redis
    .multi()
    .sadd("flags", key)
    .set(`flag:${key}`, value ? "1" : "0")
    .exec();
};

// Flag initialization function
export const initiateFlags = async (initialFlags: Record<string, boolean>) => {
  console.info("Running flag initialization");

  if (process.env.APP_ENV === "test") {
    console.info("Application is in TEST mode, skipping flag initialization");
    return;
  }

  try {
    let currentFlags = await checkAll();
    const defaultFlags: { [key: string]: boolean } = initialFlags;

    console.info("Checking for deprecated flags");

    const removeFlags = [];
    for (const key in currentFlags) {
      if (typeof defaultFlags[key] === "undefined" || defaultFlags[key] === null) {
        removeFlags.push(
          (() => {
            console.info(`Removing flag: ${key} from flag registry`);
            return removeFlag(key);
          })()
        );
      }
    }
    await Promise.all(removeFlags);

    currentFlags = await checkAll();

    console.info("Checking for new flags");

    const addFlags = [];
    for (const key in initialFlags) {
      if (typeof currentFlags[key] === "undefined" || currentFlags[key] === null) {
        addFlags.push(
          (async () => {
            console.info(`Creating flag: ${key} with value ${defaultFlags[key]}`);
            return createFlag(key, defaultFlags[key]);
          })()
        );
      }
    }
    await Promise.all(addFlags);
  } catch (err) {
    console.error(err);
  }
};

// Flush the privileges cache
export const flushPrivilegesCache = async () => {
  try {
    const redis = getRedisInstance();

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
        console.info("Cached privileges have been cleared");
        resolve();
      })
    );
  } catch (e) {
    console.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
