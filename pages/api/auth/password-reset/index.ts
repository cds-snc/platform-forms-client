import { middleware, cors, csrfProtected } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { sendPasswordResetLink } from "@lib/auth";

const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Malformed request" });
  }

  try {
    await sendPasswordResetLink(email);
    return res.status(200).json({});
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ error: "Failed to send password reset link" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  apiHandler
);
