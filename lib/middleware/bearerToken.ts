import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export interface BearerTokenPayload {
  formID?: string;
}

const validate = (
  handler: (req: NextApiRequest, res: NextApiResponse, jwtPayload: BearerTokenPayload) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const token = getBearerToken(req);
      const bearerTokenPayload = jwt.verify(
        token,
        Buffer.from(process.env.TOKEN_SECRET || "", "base64")
      );
      return handler(req, res, bearerTokenPayload as BearerTokenPayload);
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

export default validate;
