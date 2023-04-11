import { MiddlewareProps, MiddlewareRequest } from "@lib/types";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
export const mockMiddleware = (
  middlewareArray: Array<MiddlewareRequest>,
  handler: (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    return handler(req, res, {});
  };
};
