import Redis from "ioredis";

let redisConnection: Redis | null = null;

export const getRedisInstance = (): Redis => {
  if (!redisConnection) {
    if (!process.env.REDIS_URL) throw new Error("No Redis URL is configured");
    const redis = new Redis(process.env.REDIS_URL);
    redisConnection = redis;
    return redisConnection;
  } else {
    return redisConnection;
  }
};

// If there is a Redis URL configured instantiate the connection
if (process.env.REDIS_URL) {
  getRedisInstance();
}
