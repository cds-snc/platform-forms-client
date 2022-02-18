import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const blocked = true;
const pass = false;

/**
 * Checks if the session is authenticated for requested HTTP method
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

const isUserSessionExist = (methods: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
    const session = await getSession({ req });

    const useMethods = () => {
      if (methods && req.method) {
        return methods.includes(req.method);
      } else {
        // If no methods are defined check user session against all requests
        return true;
      }
    };

    if (useMethods() && !session) {
      res.status(403).json({ error: "Access Denied" });
      return blocked;
    }

    return pass;
  };
};
export default isUserSessionExist;
