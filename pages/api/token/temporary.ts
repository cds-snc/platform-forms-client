import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { logMessage } from "@lib/logger";
import validate, { BearerTokenPayload } from "@lib/middleware/bearerToken";

import { NextApiRequest, NextApiResponse } from "next";
import { QueryResult } from "pg";

const checkRequestPayload = (
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    bearerTokenPayload: BearerTokenPayload,
    email: string
  ) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse, options?: unknown): Promise<unknown> => {
    const requestBody = JSON.parse(req.body);
    try {
      if (requestBody?.email) {
        return handler(req, res, options as BearerTokenPayload, requestBody["email"]);
      } else {
        res.status(400).json({ error: "Invalid payload" });
      }
    } catch (err) {
      res.status(400).json({ error: "Invalid payload" });
    }
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  bearerTokenPayload: BearerTokenPayload,
  email: string
) => {
  try {
    const formID = bearerTokenPayload.formID;
    if (formID == undefined) {
      res.status(403).json({ error: "Invalid form request." });
      return;
    }
    const temporaryToken = createTemporaryToken(email);
    await updateTemporaryToken(temporaryToken, email, formID);
    logMessage.info(`Temporary Token Requested: Form ID: ${formID} Email: ${email}`);
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

const createTemporaryToken = (email: string): string => {
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

const updateTemporaryToken = async (
  temporaryToken: string,
  email: string,
  templateId: string
): Promise<QueryResult> => {
  return executeQuery(
    await dbConnector(),
    "UPDATE form_users SET temporary_token = ($1), updated_at = current_timestamp WHERE email = ($2) and template_id = ($3) and active = true",
    [temporaryToken, email, templateId]
  );
};

export default validate(checkRequestPayload(handler));
