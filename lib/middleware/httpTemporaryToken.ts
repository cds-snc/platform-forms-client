import { NextApiRequest, NextApiResponse } from "next";
import { TemporaryTokenPayload } from "@lib/types";
import { extractBearerTokenFromReq } from "@lib/middleware/bearerToken";
import executeQuery from "@lib/integration/queryManager";
import dbConnector from "@lib/integration/dbConnector";
import jwt from "jsonwebtoken";

const blocked = true;
const pass = false;

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
const checkIfValidTemporaryToken = (): ((
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<boolean>) => {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
    try {
      //Default value to 10 if it's undefined
      const { formID } = req.query;
      //Check that formID and maxRecords aren't repeated
      if (Array.isArray(formID)) {
        res.status(400).json({ error: "Bad Request" });
        return blocked;
      }
      //Get formID form the bearer token
      if (!formID) {
        res.status(400).json({ error: "Bad Request" });
        return blocked;
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
        return pass;
      }
      res.status(403).json({ error: "Missing or invalid bearer token." });
      return blocked;
    } catch (err) {
      //Token verification has failed
      res.status(403).json({ error: "Missing or invalid bearer token or unknown error." });
      return blocked;
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

export default checkIfValidTemporaryToken;
