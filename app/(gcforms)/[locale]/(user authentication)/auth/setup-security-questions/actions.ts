"use server";

import * as v from "valibot";
import { serverTranslation } from "@i18n";
import { createSecurityAnswers } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { AuthenticatedAction } from "@lib/actions";

export interface ErrorStates {
  validationErrors?: {
    fieldKey: string;
    fieldValue: string;
  }[];
  generalError?: string;
}

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const setupQuestions = AuthenticatedAction(
  async (_, language: string, __: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    const { t } = await serverTranslation(["setup-security-questions"], { lang: language });

    const rawFormData = Object.fromEntries(formData.entries());

    const result = await validateData(rawFormData, language);

    if (!result.success) {
      return {
        validationErrors: result.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      };
    }

    return createSecurityAnswers([
      { questionId: result.output.question1, answer: result.output.answer1 },
      { questionId: result.output.question2, answer: result.output.answer2 },
      { questionId: result.output.question3, answer: result.output.answer3 },
    ])
      .then(() => ({}))
      .catch((error) => {
        logMessage.warn(error);
        return { generalError: t("errors.serverError.title") };
      });
  }
);

// Internal and private functions - won't be converted into server actions

const validateData = async (formData: { [k: string]: FormDataEntryValue }, language: string) => {
  const { t } = await serverTranslation(["setup-security-questions"], { lang: language });
  const schema = v.pipe(
    v.object({
      question1: v.pipe(v.string(), v.minLength(1, t("errors.required"))),
      question2: v.pipe(v.string(), v.minLength(1, t("errors.required"))),
      question3: v.pipe(v.string(), v.minLength(1, t("errors.required"))),
      answer1: v.pipe(
        v.string(),
        v.toLowerCase(),
        v.trim(),
        v.minLength(1, t("errors.required")),
        v.minLength(4, t("errors.answerLength"))
      ),
      answer2: v.pipe(
        v.string(),
        v.toLowerCase(),
        v.trim(),
        v.minLength(1, t("errors.required")),
        v.minLength(4, t("errors.answerLength"))
      ),
      answer3: v.pipe(
        v.string(),
        v.toLowerCase(),
        v.trim(),
        v.minLength(1, t("errors.required")),
        v.minLength(4, t("errors.answerLength"))
      ),
    }),
    v.forward(
      v.check(
        (input) => input.answer1 !== input.answer2 && input.answer1 !== input.answer3,
        t("errors.duplicateAnswer")
      ),
      ["answer1"]
    ),
    v.forward(
      v.check(
        (input) => input.answer2 !== input.answer1 && input.answer2 !== input.answer3,
        t("errors.duplicateAnswer")
      ),
      ["answer2"]
    ),
    v.forward(
      v.check(
        (input) => input.answer3 !== input.answer1 && input.answer3 !== input.answer2,
        t("errors.duplicateAnswer")
      ),
      ["answer3"]
    )
  );

  return v.safeParse(schema, formData, { abortPipeEarly: true });
};
