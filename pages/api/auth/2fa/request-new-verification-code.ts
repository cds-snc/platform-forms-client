import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { requestNew2FAVerificationCode } from "@lib/auth/cognito";

const requestNewVerificationCode = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Malformed request" });

  await requestNew2FAVerificationCode(email);

  return res.status(200).json({});
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  requestNewVerificationCode
);
