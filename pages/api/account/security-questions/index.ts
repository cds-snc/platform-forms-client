import { middleware, cors, csrfProtected, jsonValidator, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import {
  AlreadyHasSecurityAnswers,
  DuplicatedQuestionsNotAllowed,
  InvalidSecurityQuestionId,
  SecurityAnswersNotFound,
  SecurityQuestionNotFound,
  createSecurityAnswers,
  updateSecurityAnswer,
} from "@lib/auth";
import securityQuestionsWithAssociatedAnswersSchema from "@lib/middleware/schemas/security-questions-with-associated-answers.schema.json";
import { MiddlewareProps, UserAbility, WithRequired } from "@lib/types";
import { createAbility } from "@lib/privileges";

async function saveUserSecurityAnswers(
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { questionsWithAssociatedAnswers } = req.body;

    if (!questionsWithAssociatedAnswers) {
      return res.status(400).json({ error: "Malformed request" });
    }

    await createSecurityAnswers(ability, questionsWithAssociatedAnswers);
    return res.status(200).json({});
  } catch (error) {
    if (error instanceof AlreadyHasSecurityAnswers) {
      return res.status(400).json({ error: "Security questions have already been set up" });
    } else if (error instanceof InvalidSecurityQuestionId) {
      return res
        .status(400)
        .json({ error: "One or more security question identifiers are invalid" });
    } else if (error instanceof DuplicatedQuestionsNotAllowed) {
      return res.status(400).json({ error: "All security questions must be different" });
    } else {
      return res.status(500).json({ error: "Failed to create user security answers" });
    }
  }
}

async function updateUserSecurityAnswer(
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { oldQuestionId, newQuestionId, newAnswer } = req.body;

    if (
      !oldQuestionId ||
      typeof oldQuestionId !== "string" ||
      !newQuestionId ||
      typeof newQuestionId !== "string" ||
      !newAnswer ||
      typeof newAnswer !== "string"
    ) {
      return res.status(400).json({ error: "Malformed request" });
    }

    await updateSecurityAnswer(ability, {
      oldQuestionId,
      newQuestionId,
      newAnswer,
    });
    return res.status(200).json({});
  } catch (error) {
    if (error instanceof SecurityAnswersNotFound) {
      return res.status(400).json({ error: "Security questions have not yet been set up" });
    } else if (error instanceof InvalidSecurityQuestionId) {
      return res.status(400).json({ error: "New security question identifier is invalid" });
    } else if (error instanceof SecurityQuestionNotFound) {
      return res
        .status(400)
        .json({ error: "Could not find security question with provided identifier" });
    } else if (error instanceof DuplicatedQuestionsNotAllowed) {
      return res
        .status(400)
        .json({ error: "Question identifier is already part of user security question pool" });
    } else {
      return res.status(500).json({ error: "Failed to create user security answers" });
    }
  }
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;

  try {
    const ability = createAbility(session);

    switch (req.method) {
      case "POST": {
        await saveUserSecurityAnswers(ability, req, res);
        break;
      }
      case "PUT": {
        await updateUserSecurityAnswer(ability, req, res);
        break;
      }
    }
  } catch (err) {
    logMessage.error(err);
    return res
      .status(500)
      .json({ error: "Failed to respond to /account/security-questions API request" });
  }
};

export default middleware(
  [
    cors({ allowedMethods: ["POST", "PUT"] }),
    csrfProtected(["POST", "PUT"]),
    sessionExists(),
    jsonValidator(securityQuestionsWithAssociatedAnswersSchema, {
      jsonKey: "questionsWithAssociatedAnswers",
      noValidateMethods: ["PUT"],
    }),
  ],
  apiHandler
);
