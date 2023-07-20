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

  if (!req.body.question1 || !req.body.question2 || !req.body.question3) {
    return res.status(400).json({
      message: "all questions need to be provided in the body of the request",
    });
  }

  const question1 = req.body.question1;
  const question2 = req.body.question2;
  const question3 = req.body.question3;

  const sanitizedUsername = sanitizeEmailAddressForCognito(req.body.username);

  if (question1 !== "a" || question2 !== "b" || question3 !== "c") {
    return res.status(400).json({
      message: "IncorrectSecurityAnswerException: one or more of the answers are incorrect",
    });
  }

  return res.status(200).json({ data: "success", user: sanitizedUsername });
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  securityquestions
);
