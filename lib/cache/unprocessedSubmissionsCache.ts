import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";

// Return a random number between 180 and 300  (3 minutes <-> 5 minutes)
const randomCacheExpiry = () => Math.floor(Math.random() * 180 + 120);

export const numberOfUnprocessedSubmissionsCacheCheck = async (
  formID: string
): Promise<number | null> => {
  const checkParameter = `unprocessed-submissions:${formID}`;

  try {
    const redis = await getRedisInstance();
    const value = await redis.get(checkParameter);
    if (value) {
      logMessage.debug(`Using cached number of unprocessed submissions for ${checkParameter}`);
      return Number(value);
    }
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }

  return null;
};

export const numberOfUnprocessedSubmissionsCachePut = async (
  formID: string,
  value: number
): Promise<void> => {
  const modifyParameter = `unprocessed-submissions:${formID}`;

  try {
    const redis = await getRedisInstance();

    await redis.setex(modifyParameter, randomCacheExpiry(), value);
    logMessage.debug(`Updating cached number of unprocessed submissions for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
