import { NextApiRequest, NextApiResponse } from "next";
import { extractBearerTokenFromReq } from "@lib/middleware/validBearerToken";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { validTemporaryToken as validateToken } from "@lib/auth";

/**
 * @description
 * This middleware will make sure that the incoming request is valid by enforcing a set of
 * rules then pass the request to the handler.
 *  - Request parameters :
 *  - A formID exists
 *  - BearerToken :
 *  - Must contains an email address
 *  - It has not expired
 *  - It exists in our Database
 *  - The record found in the database includes the email, active, and template_id fields
 *  - The email on the token record matches the email in the payload.
 *  - The active flag boolean is true.
 * @param handler - A function to be called
 * @returns
 */
export const validTemporaryToken = (): MiddlewareRequest => {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> {
    try {
      //Default value to 10 if it's undefined
      const formID = req.query.form;
      //Check that formID isn't repeated
      if (Array.isArray(formID) || !formID) {
        res.status(400).json({ error: "Bad Request" });
        return { next: false };
      }
      //Get the token from request object
      const token = extractBearerTokenFromReq(req);

      const user = await validateToken(token);

      if (user !== null) return { next: true, props: { email: user.email, temporaryToken: token } };

      res.status(403).json({ error: "Missing or invalid bearer token." });
      return { next: false };
    } catch (err) {
      //Token verification has failed
      res.status(403).json({ error: "Missing or invalid bearer token or unknown error." });
      return { next: false };
    }
  };
};
