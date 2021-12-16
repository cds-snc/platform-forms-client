import { NextApiRequest, NextApiResponse } from "next";
import validate, {
  BearerTokenPayload,
  createTemporaryToken,
  updateTemporaryToken,
} from "@lib/middleware/bearerToken";
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

export default validate(checkRequestPayload(handler));
