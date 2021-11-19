import Redis from "ioredis";

// Shout out to https://github.com/leighhalliday/nextjs-feature-flags for inspiration

const getRedisInstance = async (): Promise<Redis.Redis> => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  } else {
    // not ideal but works when you don't have local redis running.
    const { default: MockRedis } = await import("ioredis-mock");
    const mockRedisInstance: Redis.Redis = new MockRedis();
    const { default: initialSettings }: { default: Record<string, boolean> } = await import(
      "../flag_initialization/default_flag_settings.json"
    );
    for (const key in initialSettings) {
      await mockRedisInstance.sadd("flags", key);
      await mockRedisInstance.set(`flag:${key}`, "1");
    }
    return mockRedisInstance;
  }
};

let redisConnection: Redis.Redis | null = null;
getRedisInstance().then((instance) => (redisConnection = instance));

const checkConnection = async () => {
  if (!redisConnection) {
    return await getRedisInstance().then((instance) => {
      redisConnection = instance;
      return instance;
    });
  } else {
    return redisConnection;
  }
};

export const createFlag = async (key: string, value: boolean): Promise<void> => {
  await checkConnection().then(async (redis) => {
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
  });
};

export const enableFlag = async (key: string): Promise<void> => {
  await checkConnection().then(async (redis) => {
    if (process.env.REDIS_URL) {
      await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
    } else {
      await redis.sadd("flags", key);
      redis.set(`flag:${key}`, "1");
    }
  });
};

export const disableFlag = async (key: string): Promise<void> => {
  await checkConnection().then(async (redis) => {
    await redis.set(`flag:${key}`, "0");
  });
};

export const removeFlag = async (key: string): Promise<void> => {
  await checkConnection().then(async (redis) => {
    await redis.srem("flags", key);
    await redis.del(`flag:${key}`);
  });
};

const getKeys = async () => {
  return await checkConnection().then(async (redis) => {
    return redis.smembers("flags");
  });
};

export const checkOne = async (key: string): Promise<boolean> => {
  return await checkConnection().then(async (redis) => {
    const value = await redis.get(`flag:${key}`);
    return value === "1";
  });
};

export const checkAll = async (): Promise<{ [k: string]: boolean }> => {
  const keys = await getKeys();
  return checkMulti(keys);
};

export const checkMulti = async (keys: string[]): Promise<{ [k: string]: boolean }> => {
  return await checkConnection().then(async (redis) => {
    if (keys.length === 0) return {};

    const values = await redis.mget(keys.map((key) => `flag:${key}`));

    const mapped = keys.reduce((acc, key, index) => {
      acc.set(key, values[index] === "1");
      return acc;
    }, new Map<string, boolean>());

    return Object.fromEntries(mapped);
  });
};
