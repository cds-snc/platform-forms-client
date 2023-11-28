import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// Return a random number between 180 and 300  (3 minutes <-> 5 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 180 + 120);

export const unprocessedSubmissionsCacheCheck = async (formID: string): Promise<boolean> => {
  try {
    const checkParameter = `form:submissions:unprocessed:${formID}`;
    const redis = await getRedisInstance();
    const value = await redis.get(checkParameter);
    if (value) {
      logMessage.debug(`Using cached number of unprocessed submissions for ${checkParameter}`);
      return value === "1";
    } else {
      return false;
    }
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

export const unprocessedSubmissionsCachePut = async (
  formID: string,
  value: boolean
): Promise<void> => {
  try {
    const modifyParameter = `form:submissions:unprocessed:${formID}`;

    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), value ? "1" : "0");
    logMessage.debug(`Updating cached number of unprocessed submissions for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
