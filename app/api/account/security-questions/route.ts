import { middleware, csrfProtected, jsonValidator, sessionExists } from "@lib/middleware";
import { type NextRequest, NextResponse } from "next/server";
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
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { questionsWithAssociatedAnswers } = await req.json();

    if (!questionsWithAssociatedAnswers) {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    await createSecurityAnswers(ability, questionsWithAssociatedAnswers);
    return NextResponse.json({});
  } catch (error) {
    if (error instanceof AlreadyHasSecurityAnswers) {
      return NextResponse.json(
        { error: "Security questions have already been set up" },
        { status: 400 }
      );
    } else if (error instanceof InvalidSecurityQuestionId) {
      return NextResponse.json(
        { error: "One or more security question identifiers are invalid" },
        { status: 400 }
      );
    } else if (error instanceof DuplicatedQuestionsNotAllowed) {
      return NextResponse.json(
        { error: "All security questions must be different" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to create user security answers" },
        { status: 500 }
      );
    }
  }
}

async function updateUserSecurityAnswer(
  ability: UserAbility,
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { oldQuestionId, newQuestionId, newAnswer } = await req.json();

    if (
      !oldQuestionId ||
      typeof oldQuestionId !== "string" ||
      !newQuestionId ||
      typeof newQuestionId !== "string" ||
      !newAnswer ||
      typeof newAnswer !== "string"
    ) {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    await updateSecurityAnswer(ability, {
      oldQuestionId,
      newQuestionId,
      newAnswer,
    });
    return NextResponse.json({});
  } catch (error) {
    if (error instanceof SecurityAnswersNotFound) {
      return NextResponse.json(
        { error: "Security questions have not yet been set up" },
        { status: 400 }
      );
    } else if (error instanceof InvalidSecurityQuestionId) {
      return NextResponse.json(
        { error: "New security question identifier is invalid" },
        { status: 400 }
      );
    } else if (error instanceof SecurityQuestionNotFound) {
      return NextResponse.json(
        { error: "Could not find security question with provided identifier" },
        { status: 400 }
      );
    } else if (error instanceof DuplicatedQuestionsNotAllowed) {
      return NextResponse.json(
        { error: "Question identifier is already part of user security question pool" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to update user security answers" },
        { status: 500 }
      );
    }
  }
}

export const POST = middleware(
  [
    csrfProtected(),
    sessionExists(),
    jsonValidator(securityQuestionsWithAssociatedAnswersSchema, {
      jsonKey: "questionsWithAssociatedAnswers",
    }),
  ],
  (req, props) => {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);
    return saveUserSecurityAnswers(ability, req);
  }
);

export const PUT = middleware([csrfProtected(), sessionExists()], (req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const ability = createAbility(session);
  return updateUserSecurityAnswer(ability, req);
});
