import { MiddlewareReturn } from "@lib/types";
import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "./cors";

/**
 * Checks if the HTTP method of the request is part of the allowed list
 * @param methods Array of acceptable HTTP methods
 * @returns boolean, true if middleware blocked the request
 */

export const httpMethodAllowed = (methods: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      const requestBody = req.body && Object.keys(req.body).length > 0 ? req.body : undefined;
      const method = requestBody?.method ? requestBody.method : req.method;
      if (!methods.includes(method)) {
        res.status(403).json({ error: "HTTP Method Forbidden" });
        return { pass: false };
      }

      // Also check CORS by evaluating the origin of the request
      const blockedByCors = await cors({ origin: "*", methods: methods })(req, res);
      if (!blockedByCors.pass) {
        return { pass: false };
      }
      return { pass: true };
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { pass: false };
    }
  };
};
