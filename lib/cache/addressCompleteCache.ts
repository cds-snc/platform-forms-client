"use server";

import { logMessage } from "@lib/logger";
import { getRedisInstance } from "../integration/redisConnector";
import { AddressCompleteChoice } from "@root/components/clientComponents/forms/AddressComplete/types";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean = process.env.APP_ENV !== "test" && Boolean(process.env.REDIS_URL);

// Week Long
const cacheExpiry = 604800;

export const checkAddressCompleteCache = async (
  address: string
): Promise<AddressCompleteChoice | null> => {
  const checkParameter = `address:complete:${address}`;
  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        return JSON.parse(value) as AddressCompleteChoice;
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

export const setAddressCompleteCache = async (
  key: string,
  choice: AddressCompleteChoice
): Promise<void> => {
  const modifyParameter = `address:complete:${key}`;
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();
    await redis.setex(modifyParameter, cacheExpiry, JSON.stringify(choice));
    logMessage.debug(`Updating Cached Complete Address for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};
