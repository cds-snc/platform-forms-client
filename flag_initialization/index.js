// Flags initial state values
const Redis = require("ioredis");
const initialFlags = require("./default_flag_settings");

/*
const initialFlags = process.env.CYPRESS
  ? // Testing variables
    {
      sandbox: true,
      vault: false,
      googleAnalytics: false,
      unpublishedForms: true,
      submitToReliabilityQueue: false,
      notifyPreview: false,
    }
  : // Default variables for application
    {
      sandbox: false,
      vault: false,
      googleAnalytics: false,
      unpublishedForms: false,
      submitToReliabilityQueue: false,
      notifyPreview: false,
    };
*/

const initiateFlags = async () => {
  console.log("Running flag initiation");
  const redis = new Redis(6379, process.env.REDIS_URL);

  const checkAll = async () => {
    const keys = await redis.smembers("flags");
    return checkMulti(keys);
  };

  const checkMulti = async (keys) => {
    if (keys.length === 0) return {};

    const values = await redis.mget(keys.map((key) => `flag:${key}`));

    const mapped = keys.reduce((acc, key, index) => {
      acc.set(key, values[index] === "1");
      return acc;
    }, new Map());

    return Object.fromEntries(mapped);
  };

  const removeFlag = async (key) => {
    await redis.srem("flags", key);
    await redis.del(`flag:${key}`);
  };

  const createFlag = async (key, value) => {
    await redis
      .multi()
      .sadd("flags", key)
      .set(`flag:${key}`, value ? "1" : "0")
      .exec();
  };

  let currentFlags = await checkAll();
  // Remove flags that are no longer in use
  for (const key in currentFlags) {
    if (typeof initialFlags[key] === "undefined" || initialFlags[key] === null) {
      console.log(`Removing flag: ${key} from flag registry`);
      await removeFlag(key);
    }
  }
  // Create missing flags
  // Refresh keys
  currentFlags = await checkAll();
  for (const key in initialFlags) {
    if (typeof currentFlags[key] === "undefined" || currentFlags[key] === null) {
      console.log(`Creating flag: ${key} with value ${initialFlags[key]}`);
      await createFlag(key, initialFlags[key]);
    }
  }
};

if (process.env.REDIS_URL) {
  initiateFlags();
} else {
  console.log("No Redis instance to initiate flags.  Application will fallback onto ioredis-mock");
}
