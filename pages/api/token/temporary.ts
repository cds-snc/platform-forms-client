import { NextApiRequest, NextApiResponse } from "next";
import validate, {
  BearerTokenPayload,
  createTemporaryToken,
  saveTemporaryToken,
} from "@lib/middleware/bearerToken";
import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { formUser } from "@lib/types-database";

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
      if (Object.prototype.hasOwnProperty.call(requestBody, "email")) {
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
    // TODO: create temporary token
    if (bearerTokenPayload.formID == undefined) {
      return;
    }
    const form = await getForm(bearerTokenPayload.formID || "", email);
    const temporaryToken = createTemporaryToken(email);
    // saveTemporaryToken(temporaryToken);
    res.status(200).json("success");
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

async function getForm(formID: string, email: string): Promise<unknown> {
  const resultObject = await executeQuery(
    await dbConnector(),
    "SELECT id, email, active FROM form_users WHERE template_id = ($1) and email = ($2)",
    [formID, email]
  );
  if (resultObject.rowCount === 1) {
    return resultObject.rows[0]["email"];
  } else {
    return undefined;
  }
}

export default validate(checkRequestPayload(handler));
