import { CacheHandler } from "@neshca/cache-handler";
import createLruHandler from "@neshca/cache-handler/local-lru";
// import createRedisHandler from "@neshca/cache-handler/redis-stack";
// import { createClient } from "redis";

// This file is currently in js module format because it is imported into next.config.mjs
// Once next js config supports type script this file can be convereted to ts module format

CacheHandler.onCreation(async () => {
  // let redisHandler;
  // if (process.env.REDIS_URL) {
  //   // always create a Redis client inside the `onCreation` callback
  //   const client = createClient("redis://localhost:6379");

  //   client.on("error", () => {});

  //   redisHandler = await createRedisHandler({
  //     client,
  //     prefix: "next-cache:",
  //     // timeout for the Redis client operations like `get` and `set`
  //     // after this timeout, the operation will be considered failed and the `localHandler` will be used
  //     timeoutMs: 2000,
  //   });
  // }

  // Create an in-memory Least Recently Used cache for use when NextJS is Building or Redis is unavailable
  const localHandler = createLruHandler({
    maxItemsNumber: 1000, // 1000 items
    maxItemSizeBytes: 1024 * 1024 * 50, // 50 MB
  });

  return {
    handlers: [localHandler],
    ttl: { defaultStaleAge: 3600, estimateExpireAge: (staleAge) => staleAge * 2 },
  };
});

export default CacheHandler;
