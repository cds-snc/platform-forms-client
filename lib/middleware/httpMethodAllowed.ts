import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "./cors";

const blocked = true;
const pass = false;

/**
 * Checks if the HTTP method of the request is part of the allowed list
 * @param methods Array of acceptable HTTP methods
 * @returns boolean, true if middleware blocked the request
 */

const methodAllowed = (methods: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
    try {
      const requestBody = req.body && Object.keys(req.body).length > 0 ? req.body : undefined;
      const method = requestBody?.method ? requestBody.method : req.method;
      if (!methods.includes(method)) {
        res.status(403).json({ error: "HTTP Method Forbidden" });
        return blocked;
      }

      // Also check CORS by evaluating the origin of the request
      const blockedByCors = await cors({ origin: "*", methods: methods })(req, res);
      if (blockedByCors) {
        return blocked;
      }
      return pass;
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return blocked;
    }
  };
};

export default methodAllowed;
