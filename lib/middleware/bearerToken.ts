import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";

export interface BearerTokenPayload {
  formID?: string;
}

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

const getBearerToken = (req: NextApiRequest) => {
  const authHeader = String(req.headers["authorization"] || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7, authHeader.length);
  } else {
    throw new Error("Missing bearer token.");
  }
};

const checkBearerToken = async (bearerToken: string): Promise<boolean> => {
  const queryResults = await executeQuery(
    await dbConnector(),
    "SELECT bearer_token from templates WHERE bearer_token = ($1)",
    [bearerToken]
  );
  return queryResults.rowCount > 0;
};

export default validate;
