import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { QueryResult } from "pg";

export interface BearerTokenPayload {
  formID?: string;
}

const validate = (
  handler: (req: NextApiRequest, res: NextApiResponse, options?: unknown) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const token = getBearerToken(req);
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

export const createTemporaryToken = (email: string): string => {
  if (process.env.TOKEN_SECRET) {
    return jwt.sign(
      {
        email: email,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  } else {
    throw new Error("Could not create temporary token: TOKEN_SECRET not defined.");
  }
};

export const updateTemporaryToken = async (
  temporary_token: string,
  email: string,
  template_id: string
): Promise<QueryResult> => {
  return executeQuery(
    await dbConnector(),
    "UPDATE form_users SET temporary_token = ($1), updated_at = current_timestamp WHERE email = ($2) and template_id = ($3)",
    [temporary_token, email, template_id]
  );
};

export default validate;
