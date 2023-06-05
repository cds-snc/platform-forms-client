import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { requestNew2FAVerificationCode } from "@lib/auth";

const requestNewVerificationCode = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authenticationFlowToken, email } = req.body;

  if (!authenticationFlowToken || !email)
    return res.status(400).json({ error: "Malformed request" });

  try {
    await requestNew2FAVerificationCode(authenticationFlowToken, email);
    return res.status(200).json({});
  } catch (error) {
    // TODO: Proper error handling
    return res.status(400).json({});
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  requestNewVerificationCode
);
