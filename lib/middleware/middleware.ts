import { logMessage } from "@lib/logger";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
const middleware = (
  middlewareArray: Array<(req: NextApiRequest, res: NextApiResponse) => Promise<boolean>>,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      let blockedByMiddleware = false;
      for (const middlewareLayer of middlewareArray) {
        const blocked = await middlewareLayer(req, res);
        if (blocked) {
          blockedByMiddleware = blocked;
          break;
        }
      }
      if (!blockedByMiddleware) {
        await handler(req, res);
      }
    } catch (e) {
      logMessage.error(e as Error);
      res.status(500).json({ error: "Server Middleware Error" });
    }
  };
};

export default middleware;
