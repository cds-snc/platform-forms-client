import { CacheHandler } from "@neshca/cache-handler";
import createLruHandler from "@neshca/cache-handler/local-lru";

CacheHandler.onCreation(async () => {
  // Create an in-memory Least Recently Used cache to be used when running the web app in a Lambda function
  const localHandler = createLruHandler({
    maxItemsNumber: 25, // 25 items
    maxItemSizeBytes: 1024 * 1024 * 2, // 2 MB
  });

  return {
    handlers: [localHandler],
    ttl: { defaultStaleAge: 3600, estimateExpireAge: (staleAge: number) => staleAge * 2 },
  };
});

export default CacheHandler;
