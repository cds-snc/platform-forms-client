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
    return redisConnection;
  } else {
    return redisConnection;
  }
};

if (!process.env.ISOLATED_INSTANCE) {
  getRedisInstance().then((redis) => (redisConnection = redis));
}
