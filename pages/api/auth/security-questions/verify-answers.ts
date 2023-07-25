import { middleware, cors, csrfProtected, jsonValidator } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { validateSecurityAnswers } from "@lib/auth";
import securityQuestionsWithAssociatedAnswersSchema from "@lib/middleware/schemas/security-questions-with-associated-answers.schema.json";

const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, questionsWithAssociatedAnswers } = req.body;

  if (!email || typeof email !== "string" || !questionsWithAssociatedAnswers) {
    return res.status(400).json({ error: "Malformed request" });
  }

  try {
    const validationResult = await validateSecurityAnswers({
      email,
      questionsWithAssociatedAnswers,
    });

    if (validationResult) {
      return res.status(200).json({});
    } else {
      return res.status(401).json({ error: "Failed to answer security questions" });
    }
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ error: "Failed to retrieve user security questions" });
  }
};

export default middleware(
  [
    cors({ allowedMethods: ["POST"] }),
    csrfProtected(["POST"]),
    jsonValidator(securityQuestionsWithAssociatedAnswersSchema, {
      jsonKey: "questionsWithAssociatedAnswers",
    }),
  ],
  apiHandler
);
