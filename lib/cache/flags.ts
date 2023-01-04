import { getRedisInstance } from "@lib/integration/redisConnector";
import flagInitialSettings from "../../flag_initialization/default_flag_settings.json";
import { checkPrivileges } from "@lib/privileges";
import { MongoAbility } from "@casl/ability";

/**
 * Enables an Application Setting Flag
 * @param ability User's Ability Instance
 * @param key Applicaiton setting flag key
 */
export const enableFlag = async (ability: MongoAbility, key: string): Promise<void> => {
  checkPrivileges(ability, [{ action: "update", subject: "Flag" }]);
  const redis = await getRedisInstance();
  await redis.multi().sadd("flags", key).set(`flag:${key}`, "1").exec();
};

/**
 * Disables an Application Setting Flag
 * @param ability User's Ability Instance
 * @param key Application setting flag key
 */
export const disableFlag = async (ability: MongoAbility, key: string): Promise<void> => {
  checkPrivileges(ability, [{ action: "update", subject: "Flag" }]);
  const redis = await getRedisInstance();
  await redis.set(`flag:${key}`, "0");
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
export const checkAll = async (ability: MongoAbility): Promise<{ [k: string]: boolean }> => {
  checkPrivileges(ability, [{ action: "view", subject: "Flag" }]);
  const keys = await getKeys();
  return checkMulti(keys);
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
