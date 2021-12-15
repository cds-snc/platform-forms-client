import { NextApiRequest, NextApiResponse } from "next";
import validate, {
  BearerTokenPayload,
  createTemporaryToken,
  updateTemporaryToken,
} from "@lib/middleware/bearerToken";
import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { formUser } from "@lib/types-database";
import { QueryResult } from "pg";
import { logMessage } from "@lib/logger";

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

async function getForm(formID: string, email: string): Promise<formUser | undefined> {
  const resultObject = await (<Promise<QueryResult>>(
    executeQuery(
      await dbConnector(),
      "SELECT id, email FROM form_users WHERE template_id = ($1) and email = ($2) and active = true",
      [formID, email]
    )
  ));
  if (resultObject.rowCount === 1) {
    return resultObject.rows[0] as formUser;
  } else {
    return undefined;
  }
}

export default validate(checkRequestPayload(handler));
