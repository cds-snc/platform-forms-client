import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { getCsrfToken } from "next-auth/client";
import { logMessage } from "@lib/logger";

export const csrfProtected = (allowMethods: string[]): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (allowMethods && req.method && allowMethods.includes(req.method)) {
        const csrfToken = await getCsrfToken({ req });
        if (!csrfToken) throw Error("Invalid Csrf Token found");
        if (csrfToken === req.headers["x-csrf-token"]) {
          return { next: true };
        } else {
          res.status(403).json({ error: "Access Denied" });
          return { next: false };
        }
      } else {
        res.status(405).json({ error: "Method Not Allowed" });
        return { next: false };
      }
    } catch (error) {
      logMessage.error(error);
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};
