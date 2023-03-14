import { getRedisInstance } from "@lib/integration/redisConnector";
import flagInitialSettings from "../../flag_initialization/default_flag_settings.json";
import { AccessControlError, checkPrivileges } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { UserAbility } from "@lib/types";

/**
 * Enables an Application Setting Flag
 * @param ability User's Ability Instance
 * @param key Applicaiton setting flag key
 */
export const enableFlag = async (ability: UserAbility, key: string): Promise<void> => {
  try {
    checkPrivileges(ability, [{ action: "update", subject: "Flag" }]);
    const redis = await getRedisInstance();
    await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
    logEvent(ability.userID, { type: "Flag", id: key }, "EnableFlag");
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "Flag", id: key },
        "AccessDenied",
        `Attempted to enable ${key}`
      );
    }
    throw e;
  }
};

/**
 * Disables an Application Setting Flag
 * @param ability User's Ability Instance
 * @param key Application setting flag key
 */
export const disableFlag = async (ability: UserAbility, key: string): Promise<void> => {
  try {
    checkPrivileges(ability, [{ action: "update", subject: "Flag" }]);
    const redis = await getRedisInstance();
    await redis.set(`flag:${key}`, "0");
    logEvent(ability.userID, { type: "Flag", id: key }, "DisableFlag");
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "Flag", id: key },
        "AccessDenied",
        `Attempted to disable ${key}`
      );
    }
    throw e;
  }
};

const getKeys = async () => {
  const redis = await getRedisInstance();
  return redis.smembers("flags");
};

/**
 * Checks a single Application Setting Flag
 * @param key Application setting flag key
 * @returns Boolean value of Flag key
 */
export const checkOne = async (key: string): Promise<boolean> => {
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
export const checkAll = async (ability: UserAbility): Promise<{ [k: string]: boolean }> => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "Flag" }]);
    const keys = await getKeys();
    logEvent(ability.userID, { type: "Flag" }, "ListAllFlags");
    return checkMulti(keys);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Flag" },
        "AccessDenied",
        "Attemped to list all Feature Flags"
      );
    throw e;
  }
};

const checkMulti = async (keys: string[]): Promise<{ [k: string]: boolean }> => {
  const redis = await getRedisInstance();
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map<string, boolean>());

  return Object.fromEntries(mapped);
};
