import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { getCsrfToken } from "next-auth/client";

export const csrfProtected = (protectedMethods: string[]): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (isProtected(req, protectedMethods)) {
        const csrfToken = await getCsrfToken({ req });
        if (csrfToken && csrfToken === req.headers["x-csrf-token"]) {
          return { next: true };
        } else {
          res.status(403).json({ error: "Access Denied" });
          return { next: false };
        }
      } else {
        //allow unrestricted method
        return { next: true };
      }
    } catch (error) {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

const isProtected = (req: NextApiRequest, methods: string[]) => {
  if (req.method) {
    return methods.includes(req.method);
  }
  return false;
};
