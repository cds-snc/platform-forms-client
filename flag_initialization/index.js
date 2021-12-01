/* eslint-disable no-console */
// Flags initial state values
const Redis = require("ioredis");
require("dotenv").config({ path: "../.env" });
const initialFlags = require("./default_flag_settings");

const checkAll = async (redis) => {
  const keys = await redis.smembers("flags");
  return checkMulti(keys, redis);
};

const checkMulti = async (keys, redis) => {
  if (keys.length === 0) return {};

  const values = await redis.mget(keys.map((key) => `flag:${key}`));

  const mapped = keys.reduce((acc, key, index) => {
    acc.set(key, values[index] === "1");
    return acc;
  }, new Map());

  return Object.fromEntries(mapped);
};

const removeFlag = async (key, redis) => {
  await redis.srem("flags", key);
  await redis.del(`flag:${key}`);
};

const createFlag = async (key, value, redis) => {
  await redis
    .multi()
    .sadd("flags", key)
    .set(`flag:${key}`, value ? "1" : "0")
    .exec();
};
const initiateFlags = (redis) => {
  console.log("Running flag initiation");

  return checkAll(redis)
    .then(async (currentFlags) => {
      console.log("Checking for Depreceated Flags");
      for (const key in currentFlags) {
        if (typeof initialFlags[key] === "undefined" || initialFlags[key] === null) {
          console.log(`Removing flag: ${key} from flag registry`);
          await removeFlag(key, redis);
        }
      }
      return checkAll(redis);
    })
    .then(async (currentFlags) => {
      console.log("Checking for New Flags");
      for (const key in initialFlags) {
        if (typeof currentFlags[key] === "undefined" || currentFlags[key] === null) {
          console.log(`Creating flag: ${key} with value ${initialFlags[key]}`);
          await createFlag(key, initialFlags[key], redis);
        }
      }
      return;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      redis.disconnect();
    });
};

if (process.env.REDIS_URL) {
  const redis = new Redis(process.env.REDIS_URL);
  initiateFlags(redis);
} else {
  console.log("No Redis instance to initiate flags.  Application will fallback onto ioredis-mock");
}
