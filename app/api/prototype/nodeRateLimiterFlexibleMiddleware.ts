import { type NextRequest, NextResponse } from "next/server";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { RateLimiterAbstract, RateLimiterRedis } from "rate-limiter-flexible";
import { getRedisInstance } from "@lib/integration/redisConnector";

// const highRateLimiter = new RateLimiterMemory({
//   keyPrefix: "high-rate-limiter",
//   points: 50, // Maximum number of points that can be consumed over duration.
//   duration: 10, // Number of seconds before consumed points are reset, starting from the time of the first consumed point on a key.
// });

// const lowRateLimiter = new RateLimiterMemory({
//   keyPrefix: "low-rate-limiter",
//   points: 20,
//   duration: 10,
// });

const highRateLimiter = new RateLimiterRedis({
  storeClient: getRedisInstance(),
  keyPrefix: "high-rate", // must be unique for limiters with different purpose
  points: 50, // Maximum number of points that can be consumed over duration.
  duration: 10, // Number of seconds before consumed points are reset, starting from the time of the first consumed point on a key.
  inMemoryBlockOnConsumed: 50, // https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#apply-in-memory-block-strategy-to-avoid-extra-requests-to-store
  inMemoryBlockDuration: 10, // https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#apply-in-memory-block-strategy-to-avoid-extra-requests-to-store
});

const lowRateLimiter = new RateLimiterRedis({
  storeClient: getRedisInstance(),
  keyPrefix: "low-rate",
  points: 20,
  duration: 10,
  inMemoryBlockOnConsumed: 20,
  inMemoryBlockDuration: 10,
});

const highRateLimiterAllowedAPIKeys = ["consumer-3", "consumer-7", "consumer-9"];

function getRateLimiterForApiKey(apiKey: string): RateLimiterAbstract {
  if (highRateLimiterAllowedAPIKeys.includes(apiKey)) return highRateLimiter;
  return lowRateLimiter;
}

export const nodeRateLimiterFlexible = (): MiddlewareRequest => {
  return async (request: NextRequest): Promise<MiddlewareReturn> => {
    try {
      const apiKey = request.headers.get("API-Key") ?? "none";
      const rateLimiter = getRateLimiterForApiKey(apiKey);
      const rateLimit = await rateLimiter.consume(apiKey);
      return { next: true, props: { rateLimit } };
    } catch (error) {
      return { next: false, response: NextResponse.json({ error }, { status: 429 }) };
    }
  };
};
