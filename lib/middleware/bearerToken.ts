import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";

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
      if ((await checkBearerToken(token)) === false) {
        res.status(403).json({ error: "Missing or invalid bearer token." });
        return;
      }
      const bearerTokenPayload = jwt.verify(token, process.env.TOKEN_SECRET || "");
      return handler(req, res, bearerTokenPayload);
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
const getBearerToken = (req: NextApiRequest) => {
  const authHeader = String(req.headers["authorization"] || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7, authHeader.length);
  } else {
    throw new Error("Missing bearer token.");
  }
};

/**
 * Checks the existance of the bearer token in the database
 *
 * @param bearerToken - the token to look for in the `templates` table in the database
 * @returns boolean result of existance of bearerToken in the database
 */
const checkBearerToken = async (bearerToken: string): Promise<boolean> => {
  const queryResults = await executeQuery(
    await dbConnector(),
    "SELECT bearer_token from templates WHERE bearer_token = ($1)",
    [bearerToken]
  );
  return queryResults.rowCount > 0;
};

export default validate;
