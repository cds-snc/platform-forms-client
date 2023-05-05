import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { getCsrfToken } from "next-auth/react";

export const csrfProtected = (protectedMethods: string[]): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    if (isProtected(req, protectedMethods)) {
      // Need to remove body from NextApiRequest due to Next-Auth bug
      // Next-Auth sets the method Call based on if a Body is present on the request.
      // This causes issues with CSRF protection so only required arguments are passed.
      const clonedReq = { body: undefined, headers: req.headers };

      const csrfToken = await getCsrfToken({ req: clonedReq }).catch(() => null);
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
  };
};

const isProtected = (req: NextApiRequest, methods: string[]) => {
  if (req.method) {
    return methods.includes(req.method);
  }
  return false;
};
