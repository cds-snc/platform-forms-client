import { NextApiRequest, NextApiResponse } from "next";
import { extractBearerTokenFromReq } from "@lib/middleware/validBearerToken";
import executeQuery from "@lib/integration/queryManager";
import dbConnector from "@lib/integration/dbConnector";
import jwt from "jsonwebtoken";
import { MiddlewareRequest, MiddlewareReturn, TemporaryTokenPayload } from "@lib/types";

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
      //Verify the token
      const temporaryTokenPayload = jwt.verify(
        token,
        process.env.TOKEN_SECRET || ""
      ) as TemporaryTokenPayload;
      const { email } = temporaryTokenPayload;
      //Check if an active formUserRecord exists for the given bearerToken.
      if (await isTokenExists(formID, email as string, token)) {
        return { next: true, props: { email, temporaryToken: token } };
      }
      res.status(403).json({ error: "Missing or invalid bearer token." });
      return { next: false };
    } catch (err) {
      //Token verification has failed
      res.status(403).json({ error: "Missing or invalid bearer token or unknown error." });
      return { next: false };
    }
  };
};

/*@description
 * It returns true if there is an active token otherwise false.
 * @param formID - The id of the form
 * @param email - The email that is associated to the formID
 * @token - The temporary token
 * @returns true or false
 */
const isTokenExists = async (formID: string, email: string, token: string): Promise<boolean> => {
  return (
    (
      await executeQuery(
        await dbConnector(),
        "SELECT 1 FROM form_users WHERE template_id = ($1) and email = ($2) and temporary_token = ($3) and active = true",
        [formID, email, token]
      )
    ).rows.length === 1
  );
};
