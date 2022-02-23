import { logMessage } from "@lib/logger";
import { MiddlewareProps, MiddlewareRequest } from "@lib/types";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
const middleware = (
  middlewareArray: Array<MiddlewareRequest>,
  handler: (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      let blockedByMiddleware = false;
      let props = {};
      for (const middlewareLayer of middlewareArray) {
        const { pass, props: middlewareProps } = await middlewareLayer(req, res, props);
        if (!pass) {
          blockedByMiddleware = true;
          break;
        }
        props = { ...props, ...middlewareProps };
      }
      if (!blockedByMiddleware) {
        await handler(req, res, props);
      }
    } catch (e) {
      logMessage.error(e as Error);
      res.status(500).json({ error: "Server Middleware Error" });
    }
  };
};

export default middleware;
