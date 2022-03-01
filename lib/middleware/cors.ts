import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { logMessage } from "@lib/logger";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";

const corsHandler = (options: Cors.CorsOptions): MiddlewareRequest => {
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
      });
      // In pre-flight the callback is not run.  Need to resolve outside of CORS callback
      // Checking if response was sent back to client
      return resolve(res.writableEnded ? { next: false } : { next: true });
    });
};

/**
 * Checks if the HTTP method of the request and origin is part of the allowed list
 * @param options Array of acceptable HTTP methods and origin
 * @returns boolean, true if middleware blocked the request
 */
export const cors = ({
  allowedMethods,
  origin = "*",
}: {
  allowedMethods: string[];
  origin?: string;
}) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      const requestBody = req.body && Object.keys(req.body).length > 0 ? req.body : undefined;
      const method = requestBody?.method ? requestBody.method : req.method;

      const corsResponse = await corsHandler({ origin, methods: allowedMethods })(req, res);
      if (!corsResponse.next) {
        // Response already sent to client, stop processing
        return corsResponse;
      }

      // If the request is not originated in a browser need to manually check http methods
      if (!allowedMethods.includes(method)) {
        res.status(403).json({ error: "HTTP Method Forbidden" });
        return { next: false };
      }

      return { next: true };
    } catch (e) {
      logMessage.error(e as Error);
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};
