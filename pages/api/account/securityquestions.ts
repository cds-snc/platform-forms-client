import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { sanitizeEmailAddressForCognito } from "@lib/auth";

// This is a mock API endpoint for the security questions page
const securityquestions = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.body.username) {
    return res.status(400).json({
      message: "username needs to be provided in the body of the request",
    });
  }

  const sanitizedUsername = sanitizeEmailAddressForCognito(req.body.username);

  return res.status(200).json({ data: "success", user: sanitizedUsername });
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  securityquestions
);
