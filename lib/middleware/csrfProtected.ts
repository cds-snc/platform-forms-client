import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { getCsrfToken } from "next-auth/client";

export const csrfProtected = (): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      const csrfToken = (await getCsrfToken({ req })) as string;

      if (csrfToken !== String(req.headers["x-csrf-token"] || "")) {
        res.status(400).json({ error: "Invalid csrf token" });
        return { next: false };
      } else {
        return { next: true };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};
