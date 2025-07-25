"use server";

import { AuthenticatedAction } from "@lib/actions";
import { updateSecurityAnswer } from "@lib/auth";
import { revalidatePath } from "next/cache";
import * as v from "valibot";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const updateSecurityQuestion = AuthenticatedAction(
  async (_, oldQuestionId: string, newQuestionId: string, answer: string | undefined) => {
    const data = validateData({ oldQuestionId, newQuestionId, newAnswer: answer });

    if (!data.success) {
      return {
        error: "Data did not pass validation",
      };
    }

    const response = await updateSecurityAnswer(data.output).catch(() => {
      return {
        error: "Failed to update security question",
      };
    });
    revalidatePath("(gcforms)/[locale]/(user authentication)/profile");
    return response;
  }
);

// Internal and private functions - won't be converted into server actions

const validateData = (formData: { [k: string]: unknown }) => {
  const schema = v.object({
    oldQuestionId: v.pipe(v.string("Field is required"), v.minLength(1)),
    newQuestionId: v.pipe(v.string("Field is required"), v.minLength(1)),
    newAnswer: v.pipe(v.string("Field is required"), v.toLowerCase(), v.trim(), v.minLength(4)),
  });
  return v.safeParse(schema, formData, { abortPipeEarly: true });
};
