import { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "@lib/auth/auth";
import { MiddlewareReturn } from "@lib/types";

const useMethods = (req: NextApiRequest, methods?: string[]) => {
  if (methods && req.method) {
    return methods.includes(req.method);
  } else {
    // If no methods are defined check user session against all requests
    return true;
  }
};

/**
 * Checks if the session is authenticated for requested HTTP method
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

export const sessionExists = (methods?: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    const session = await isAuthenticated({ req, res });

    if (useMethods(req, methods) && !session) {
      res.status(401).json({ error: "Unauthorized" });
      return { next: false };
    }

    // If there is a session, return the session as props
    if (session) {
      return { next: true, props: { session } };
    }

    // If there is no session but the method is not required to be authenticated
    return { next: true };
  };
};
