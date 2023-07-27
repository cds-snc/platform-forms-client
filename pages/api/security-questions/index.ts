import { middleware, cors } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { retrievePoolOfSecurityQuestions } from "@lib/auth";

const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const securityQuestions = await retrievePoolOfSecurityQuestions();
    return res.status(200).json(securityQuestions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve pool of security questions" });
  }
};

export default middleware([cors({ allowedMethods: ["GET"] })], apiHandler);
