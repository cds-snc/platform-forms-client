import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { getTokenById } from "../../pages/api/id/[form]/bearer";
import { BearerTokenPayload, FormDBConfigProperties } from "@lib/types";

/**
 * This is a middleware function that will validate the bearer token in the authorization header
 *
 * @param handler - the function to be executed next in the API call
 * @returns either the handler to be executed next in the API call, or updates the res status and returns void
 */
const validate = (
  handler: (req: NextApiRequest, res: NextApiResponse, options?: unknown) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const token = getBearerToken(req);
      const bearerTokenPayload = jwt.verify(token, process.env.TOKEN_SECRET || "");
      if (
        (
          (await getTokenById((bearerTokenPayload as BearerTokenPayload).formID || ""))
            .rows[0] as FormDBConfigProperties
        ).bearerToken === token
      ) {
        return handler(req, res, bearerTokenPayload);
      } else {
        return res.status(403).json({ error: "Missing or invalid bearer token." });
      }
    } catch (err) {
      res.status(403).json({ error: "Missing or invalid bearer token." });
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
export const getBearerToken = (req: NextApiRequest): string => {
  const authHeader = String(req.headers["authorization"] || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7, authHeader.length);
  } else {
    throw new Error("Missing bearer token.");
  }
};

export default validate;
