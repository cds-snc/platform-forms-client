import { NextApiRequest, NextApiResponse } from "next";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { getTokenById } from "../../pages/api/id/[form]/bearer";
import { BearerTokenPayload, MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { logMessage } from "../logger";

/**
 * This is a middleware function that will validate the bearer token in the authorization header
 *
 * @param handler - the function to be executed next in the API call
 * @returns either the handler to be executed next in the API call, or updates the res status and returns void
 */
const httpBearerToken = (): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      const token = extractBearerTokenFromReq(req);
      const { formID } = jwt.verify(token, process.env.TOKEN_SECRET ?? "") as BearerTokenPayload;
      const tokenID = await getTokenById(formID);
      if (tokenID.rows[0].bearerToken === token) {
        return { pass: true, props: { formID } };
      } else {
        res.status(403).json({ error: "Missing or invalid bearer token." });
        return { pass: false };
      }
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        logMessage.error("An expired bearer token has been used.");
      }
      res.status(403).json({ error: "Missing or invalid bearer token." });
      return { pass: false };
    }
  };
};

/**
 * Extracts the bearer token from the authorization header
 *
 * @param req - the api request containing the authorization header
 * @returns The bearer token string
 *
 * @throws
 * This exception is thrown if the bearer token is not found
 */
export const extractBearerTokenFromReq = (req: NextApiRequest): string => {
  const authHeader = String(req.headers["authorization"] || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7, authHeader.length);
  } else {
    throw new Error("Missing bearer token.");
  }
};

export default httpBearerToken;
