import { NextResponse } from "next/server";
import { middleware } from "@lib/middleware";
import { nodeRateLimiterFlexible } from "./nodeRateLimiterFlexibleMiddleware";

export const GET = middleware([nodeRateLimiterFlexible()], async (_, props) => {
  return NextResponse.json({
    success: true,
    rateLimit: (props as unknown as Record<string, unknown>).rateLimit,
  });
});
