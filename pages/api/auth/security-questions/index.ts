import { middleware, cors } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { retrieveUserSecurityQuestions } from "@lib/auth";

const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const email = req.query.email;

  if (!email || Array.isArray(email)) return res.status(400).json({ error: "Malformed request" });

  try {
    const securityQuestions = await retrieveUserSecurityQuestions({ email });
    return res.status(200).json(securityQuestions);
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ error: "Failed to retrieve user security questions" });
  }
};

export default middleware([cors({ allowedMethods: ["GET"] })], apiHandler);
