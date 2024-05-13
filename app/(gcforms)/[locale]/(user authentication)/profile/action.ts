"use server";
import { updateSecurityAnswer } from "@lib/auth";
import { authCheck } from "@lib/actions";
import { revalidatePath } from "next/cache";
import * as v from "valibot";

const validateData = (formData: { [k: string]: unknown }) => {
  const schema = v.object({
    oldQuestionId: v.string("Field is required", [v.minLength(1)]),
    newQuestionId: v.string("Field is required", [v.minLength(1)]),
    newAnswer: v.string("Field is required", [v.toLowerCase(), v.toTrimmed(), v.minLength(4)]),
  });
  return v.safeParse(schema, formData, { abortPipeEarly: true });
};

export const updateSecurityQuestion = async (
  oldQuestionId: string,
  newQuestionId: string,
  answer: string | undefined
) => {
  const { ability } = await authCheck();

  const data = validateData({ oldQuestionId, newQuestionId, newAnswer: answer });

  if (!data.success) {
    throw new Error("Data not Valid");
  }

  await updateSecurityAnswer(ability, data.output);
  revalidatePath("(gcforms)/[locale]/(user authentication)/profile");
};
