import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { requestNew2FAVerificationCode } from "@lib/auth";
import { Missing2FASession } from "@lib/auth/cognito";

const requestNewVerificationCode = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authenticationFlowToken, email } = req.body;

  if (!authenticationFlowToken || !email)
    return res.status(400).json({ error: "Malformed request" });

  try {
    await requestNew2FAVerificationCode(authenticationFlowToken, email);
    return res.status(200).json({});
  } catch (error) {
    if (error instanceof Missing2FASession) {
      return res.status(401).json({ message: "Missing 2FA session" });
    } else {
      return res.status(500).json({ message: "Failed to send a new verification code" });
    }
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  requestNewVerificationCode
);
