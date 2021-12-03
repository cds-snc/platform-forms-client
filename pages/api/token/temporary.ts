import { NextApiRequest, NextApiResponse } from "next";
import validate, { BearerTokenPayload } from "@lib/middleware/bearerToken";

const checkBearerTokenPayload = (
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    bearerTokenPayload: BearerTokenPayload
  ) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    const requestBody = JSON.parse(req.body);
    try {
      if (Object.prototype.hasOwnProperty.call(requestBody, "email")) {
        return handler;
      } else {
        res.status(400).json({ error: "Invalid payload" });
      }
    } catch (err) {
      res.status(400).json({ error: "Invalid payload" });
    }
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // TODO: create temporary token
    res.status(200).json("success");
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default validate(checkBearerTokenPayload(handler));
