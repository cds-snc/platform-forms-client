import Redis from "ioredis";
import useSWR from "swr";

// Shout out to https://github.com/leighhalliday/nextjs-feature-flags for inspiration

// Eventually set to proper Redis url
const redis = new Redis();

export const createFlag = async (key: string, value: boolean): Promise<void> => {
  await redis
    .multi()
    .sadd("flags", key)
    .set(`flag:${key}`, value ? "1" : "0")
    .exec();
};

export const enableFlag = async (key: string): Promise<void> => {
  await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
};

export const disableFlag = async (key: string): Promise<void> => {
  await redis.set(`flag:${key}`, "0");
};

export const removeFlag = async (key: string): Promise<void> => {
  await redis.srem("flags", key);
  await redis.del(`flag:${key}`);
};

const getKeys = async () => {
  return redis.smembers("flags");
};

export const checkOne = async (key: string): Promise<boolean> => {
  const value = await redis.get(`flag:${key}`);
  return value === "1";
};

export const checkAll = async (): Promise<{ [k: string]: boolean }> => {
  const keys = await getKeys();
  return checkMulti(keys);
};

export const checkMulti = async (keys: string[]): Promise<{ [k: string]: boolean }> => {
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map<string, boolean>());

  return Object.fromEntries(mapped);
};
