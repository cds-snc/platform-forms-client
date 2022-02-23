import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { logMessage } from "@lib/logger";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";

/**
 * Initializes and returns a CORS middleware promise
 * @param options CORS options
 * @returns Middleware function accepting a req and res arguments. Returns true if middleware blocked the request
 */

export const cors = (options: Cors.CorsOptions): MiddlewareRequest => {
  logMessage.info("Initializing Cors options");
  const initializedCors = Cors({ ...options });

  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise<MiddlewareReturn>((resolve, reject) => {
      logMessage.debug("Running Cors");
      initializedCors(req, res, (result) => {
        if (result instanceof Error) {
          logMessage.debug(`Cors Rejects with ${result}`);
          res.status(403).json({ error: "HTTP Method Forbidden" });
          return reject({ pass: false });
        }
        logMessage.debug(`Cors Accepts with ${result} `);
        return resolve({ pass: true });
      });
    });
};
