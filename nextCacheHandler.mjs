/* eslint-disable no-console */
import { CacheHandler } from "@neshca/cache-handler";
import createLruHandler from "@neshca/cache-handler/local-lru";

// This file is currently in js module format because it is imported into next.config.mjs
// Once Next.js config supports TypeScript this file can be converted to `ts` module format

CacheHandler.onCreation(async () => {
  // Create an in-memory Least Recently Used cache for use in PR review environments
  const localHandler = createLruHandler({
    maxItemsNumber: 25, // 25 items
    maxItemSizeBytes: 1024 * 1024 * 2, // 2 MB
  });

  return {
    handlers: [localHandler],
    ttl: { defaultStaleAge: 3600, estimateExpireAge: (staleAge) => staleAge * 2 },
  };
});

export default CacheHandler;
