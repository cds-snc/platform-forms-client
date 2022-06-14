import { getRedisInstance } from "./integration/redisConnector";
import flagInitialSettings from "../flag_initialization/default_flag_settings.json";

export const createFlag = async (key: string, value: boolean): Promise<void> => {
  const redis = await getRedisInstance();
  await redis
    .multi()
    .sadd("flags", key)
    .set(`flag:${key}`, value ? "1" : "0")
    .exec();
};

export const enableFlag = async (key: string): Promise<void> => {
  const redis = await getRedisInstance();
  await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
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
  if (process.env.APP_ENV === "test") {
    return (flagInitialSettings as Record<string, boolean>)[key];
  }
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
