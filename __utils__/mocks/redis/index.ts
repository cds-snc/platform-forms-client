import Redis from "ioredis-mock";

jest.mock("@lib/integration/redisConnector", () => {
  const redis = new Redis();
  return {
    getRedisInstance: jest.fn(async () => redis),
  };
});
