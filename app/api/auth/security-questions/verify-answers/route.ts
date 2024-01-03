import { middleware, csrfProtected, jsonValidator } from "@lib/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { validateSecurityAnswers } from "@lib/auth";
import securityQuestionsWithAssociatedAnswersSchema from "@lib/middleware/schemas/security-questions-with-associated-answers.schema.json";

interface VerifyAnswersRequest {
  email?: string;
  questionsWithAssociatedAnswers?: {
    questionId: string;
    answer: string;
  }[];
}

export const POST = middleware(
  [
    csrfProtected(),
    jsonValidator(securityQuestionsWithAssociatedAnswersSchema, {
      jsonKey: "questionsWithAssociatedAnswers",
    }),
  ],
  async (req: NextRequest) => {
    const { email, questionsWithAssociatedAnswers }: VerifyAnswersRequest = await req.json();

    if (!email || !questionsWithAssociatedAnswers) {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    try {
      const validationResult = await validateSecurityAnswers({
        email,
        questionsWithAssociatedAnswers,
      });

      if (validationResult) {
        return NextResponse.json({}, { status: 200 });
      } else {
        return NextResponse.json({ error: "Failed to answer security questions" }, { status: 401 });
      }
    } catch (err) {
      logMessage.error(err);
      return NextResponse.json({ error: "Failed to answer security questions" }, { status: 500 });
    }
  }
);
