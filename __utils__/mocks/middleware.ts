import { MiddlewareProps, MiddlewareRequest } from "@lib/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
export const mockMiddleware = (
  _: Array<MiddlewareRequest>,
  handler: (req: NextRequest, props: MiddlewareProps) => Promise<NextResponse>
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    return handler(req, { body: {} });
  };
};
