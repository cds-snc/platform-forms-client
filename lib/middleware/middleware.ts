import { logMessage } from "@lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, MiddlewareRequest } from "@lib/types";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
export const middleware = (
  middlewareArray: Array<MiddlewareRequest>,
  handler: (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      let props = {};
      for (const middlewareLayer of middlewareArray) {
        // Middleware is run sequentially
        // eslint-disable-next-line no-await-in-loop
        const { next: pass, props: middlewareProps } = await middlewareLayer(req, res);
        if (!pass) return;

        props = { ...props, ...middlewareProps };
      }
      return handler(req, res, props);
    } catch (e) {
      logMessage.error(e as Error);
      res.status(500).json({ error: "Server Middleware Error" });
    }
  };
};
