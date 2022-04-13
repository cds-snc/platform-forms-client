import Redis from "ioredis";

let redisConnection: Redis | null = null;

const createRedisInstance = async (): Promise<Redis> => {
  if (process.env.REDIS_URL && !(process.env.NODE_ENV === "test")) {
    return new Redis(process.env.REDIS_URL);
  } else {
    // not ideal but works when you don't have local redis running.
    const { default: MockRedis } = await import("ioredis-mock");
    const mockRedisInstance: Redis = new MockRedis();
    return mockRedisInstance;
  }
};

export const getRedisInstance = async (): Promise<Redis> => {
  if (!redisConnection) {
    const redis = await createRedisInstance();
    redisConnection = redis;
    return redisConnection;
  } else {
    return redisConnection;
  }
};

getRedisInstance().then((redis) => (redisConnection = redis));
