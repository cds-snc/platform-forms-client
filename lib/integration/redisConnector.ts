import Redis from "ioredis";

let redisConnection: Redis | null = null;

const createRedisInstance = async (): Promise<Redis> => {
  if (!process.env.REDIS_URL) throw new Error("No Redis URL is configured");
  return new Redis(process.env.REDIS_URL);
};

export const getRedisInstance = async (): Promise<Redis> => {
  if (!redisConnection) {
    const redis = await createRedisInstance();
    redisConnection = redis;
    return redis;
  } else {
    return redisConnection;
  }
};

export const createRedisSubscriber = async (): Promise<Redis> => {
  const redis = await getRedisInstance();
  // Pub/sub connections enter subscriber mode, so the shared command client
  // cannot be reused directly. duplicate() opens a dedicated socket with the
  // same connection configuration as the singleton instance.
  return redis.duplicate();
};

// If there is a Redis URL configured instantiate the connection
if (process.env.REDIS_URL) {
  // No need to set the client to the variable, as it is already set in the function
  getRedisInstance();
}
