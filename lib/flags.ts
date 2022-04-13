import { logMessage } from "@lib/logger";
import { getRedisInstance } from "./integration/redisConnector";


/**
 * Create new mocked Redis instance and populate it with values
 */
const loadMockedValues = async () => {
  // If we're using the in memory mocked version of Redis we need to load in initial values
  if (!process.env.REDIS_URL) {
    const redis = await getRedisInstance();
    const { default: initialSettings }: { default: Record<string, boolean> } = await import(
      "../flag_initialization/default_flag_settings.json"
    );
    for (const [key, value] of Object.entries(initialSettings)) {
      logMessage.debug(`Creating flag: ${key} with value ${value} (Mocked Redis)`);
      await redis.sadd("flags", key);
      await redis.set(`flag:${key}`, value ? "1" : "0");
  }
};

// Loads mocked values into ioredis-mock
loadMockedValues();

export const createFlag = async (key: string, value: boolean): Promise<void> => {
  const redis = await getRedisInstance();
  if (process.env.REDIS_URL) {
    await redis
      .multi()
      .sadd("flags", key)
      .set(`flag:${key}`, value ? "1" : "0")
      .exec();
  } else {
    // ioredis-mock does not support multi()
    await redis.sadd("flags", key);
    await redis.set(`flag:${key}`, value ? "1" : "0");
  }
};

export const enableFlag = async (key: string): Promise<void> => {
  const redis = await getRedisInstance();
  if (process.env.REDIS_URL) {
    await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
  } else {
    await redis.sadd("flags", key);
    redis.set(`flag:${key}`, "1");
  }
};

export const disableFlag = async (key: string): Promise<void> => {
  const redis = await getRedisInstance();
  await redis.set(`flag:${key}`, "0");
};

export const removeFlag = async (key: string): Promise<void> => {
  const redis = await getRedisInstance();
  await redis.srem("flags", key);
  await redis.del(`flag:${key}`);
};

const getKeys = async () => {
  const redis = await getRedisInstance();
  return redis.smembers("flags");
};

export const checkOne = async (key: string): Promise<boolean> => {
  const redis = await getRedisInstance();
  const value = await redis.get(`flag:${key}`);
  return value === "1";
};

export const checkAll = async (): Promise<{ [k: string]: boolean }> => {
  const keys = await getKeys();
  return checkMulti(keys);
};

export const checkMulti = async (keys: string[]): Promise<{ [k: string]: boolean }> => {
  const redis = await getRedisInstance();
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map<string, boolean>());

  return Object.fromEntries(mapped);
};
