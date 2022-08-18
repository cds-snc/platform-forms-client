import { getRedisInstance } from "./integration/redisConnector";
import { logMessage } from "@lib/logger";

export const setAcceptableUse = async (userId: string): Promise<void> => {
  try {
    const redis = await getRedisInstance();
    await redis.set(`auth:acceptableUse:${userId}`, "true");
    logMessage.info("update cache value for : " + userId);
  } catch (error) {
    logMessage.error(error as Error);
    throw new Error("Could not connect to cache");
  }
};

export const removeAcceptableUse = async (userId: string): Promise<void> => {
  try {
    const redis = await getRedisInstance();
    await redis.del(`auth:acceptableUse:${userId}`);
  } catch (error) {
    logMessage.error(error as Error);
    throw new Error("Could not connect to cache");
  }
};

export const acceptableUseCheck = async (userId: string): Promise<boolean> => {
  // always return false for jest
  //if (process.env.APP_ENV === "test") return false;
  const redis = await getRedisInstance();
  const value = await redis.get(`auth:acceptableUse:${userId}`);
  logMessage.info("checking cache value for : " + userId);
  return value === "true";
};
