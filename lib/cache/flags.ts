import { getRedisInstance } from "@lib/integration/redisConnector";
import flagInitialSettings from "../flags/default_flag_settings.json";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import { logEvent } from "@lib/auditLogs";
import { FeatureFlagKeys, FeatureFlags, Flags, PickFlags } from "./types";

/**
 * Enables an Application Setting Flag
 * @param key Applicaiton setting flag key
 */
export const enableFlag = async (key: string): Promise<void> => {
  const { user } = await authorization.canManageFlags().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "Flag", id: key }, "AccessDenied", `Attempted to enable ${key}`);
    }
    throw e;
  });
  const redis = await getRedisInstance();
  await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
  logEvent(user.id, { type: "Flag", id: key }, "EnableFlag");
};

/**
 * Disables an Application Setting Flag
 * @param key Application setting flag key
 */
export const disableFlag = async (key: string): Promise<void> => {
  const { user } = await authorization.canManageFlags().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "Flag", id: key }, "AccessDenied", `Attempted to disable ${key}`);
    }
    throw e;
  });
  const redis = await getRedisInstance();
  await redis.set(`flag:${key}`, "0");
  logEvent(user.id, { type: "Flag", id: key }, "DisableFlag");
};

const getKeys = async (): Promise<FeatureFlagKeys[]> => {
  const redis = await getRedisInstance();
  const keys = await redis.smembers("flags");
  return keys.filter((key): key is FeatureFlagKeys => key in FeatureFlags);
};

/**
 * Checks a single Application Setting Flag
 * @param key Application setting flag key
 * @returns Boolean value of Flag key
 */
export const checkOne = async (key: string): Promise<boolean> => {
  // If in test mode return true for any flag
  if (process.env.APP_ENV === "test") {
    return true;
  }
  // If REDIS is not configured return the default values for the flags
  if (!process.env.REDIS_URL) {
    return (flagInitialSettings as Record<string, boolean>)[key];
  }
  const redis = await getRedisInstance();
  const value = await redis.get(`flag:${key}`);
  return value === "1";
};

/**
 * Get a list of all available Application Setting Flags and their values
 * @param ability User's Ability Instance
 * @returns An object of {flag: value ...}
 */
export const checkAll = async (): Promise<Flags> => {
  const keys = await getKeys();
  return checkMulti(keys);
};

const checkMulti = async <T extends FeatureFlagKeys[]>(keys: T): Promise<PickFlags<T>> => {
  const redis = await getRedisInstance();
  if (keys.length === 0) return {} as PickFlags<T>;

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    if (process.env.APP_ENV === "test") {
      acc.set(key, true);
    } else {
      acc.set(key, values[index] === "1");
    }
    return acc;
  }, new Map<string, boolean>());

  return Object.fromEntries(mapped) as PickFlags<T>;
};

export async function getSomeFlags<T extends FeatureFlagKeys[]>(flags: T): Promise<PickFlags<T>> {
  if (!Array.isArray(flags) || flags.length === 0) return {} as PickFlags<T>;
  return (await checkMulti(flags)) as PickFlags<T>;
}
