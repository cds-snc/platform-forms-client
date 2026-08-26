"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { createDraftVersionForTemplate } from "@lib/templates/versioning/mutations/createDraftForTemplate";

import { AuthenticatedAction } from "@lib/actions";
import { type FormRecord } from "@lib/types";

export const createDraftVersion = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      redirectAfter,
    }: {
      id: string;
      redirectAfter?: string;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    let hasError;
    let response: FormRecord | null = null;

    try {
      response = await createDraftVersionForTemplate(formID);

      if (!response) {
        throw new Error(`Unable to create a draft version for ${formID}`);
      }

      revalidatePath(`/form-builder/${formID}`, "layout");
      revalidatePath(`/form-builder/${formID}/published`, "page");
      revalidatePath(`/form-builder/${formID}/publish`, "page");
    } catch (error) {
      hasError = error;
    }

    if (!hasError && redirectAfter) {
      if (!redirectAfter.startsWith("/") || redirectAfter.startsWith("//")) {
        return { formRecord: response, error: "Invalid redirect path" };
      }
      redirect(redirectAfter);
    }

    return { formRecord: response, error: hasError ? (hasError as Error).message : undefined };
  }
);
