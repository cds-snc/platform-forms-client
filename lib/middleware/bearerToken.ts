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
      const bearerTokenPayload = jwt.verify(
        token,
        Buffer.from(process.env.TOKEN_SECRET || "", "base64")
      );
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
  return jwt.sign(
    {
      email: email,
    },
    process.env.TOKEN_SECRET || "",
    { expiresIn: "7d" }
  );
};

export const saveTemporaryToken = async (
  template_id: number,
  email: string,
  temporary_token: string,
  formID: string
): Promise<void> => {
  const responseObject = await executeQuery(
    await dbConnector(),
    "INSERT INTO forms_users (template_id, email, temporary_token, active, created_at) VALUES (($1), ($2), ($3), ($4), ($5)",
    [template_id, email, temporary_token, true, Date.now()]
  );
};

export default validate;
