"use server";

import {
  TemplateHasUnprocessedSubmissions,
  deleteTemplate,
  getFullTemplateByID,
} from "@lib/templates";
import { revalidatePath } from "next/cache";
import { FormRecord } from "@lib/types";
import { authCheckAndThrow } from "@lib/actions";

export async function getForm(
  formId: string
): Promise<{ formRecord: FormRecord | null; error?: string }> {
  try {
    const { ability } = await authCheckAndThrow();
    const response = await getFullTemplateByID(ability, formId).catch(() => {
      throw new Error("Failed to Get Form");
    });
    if (response === null) {
      throw new Error("Form Not Found");
    }
    return { formRecord: response };
  } catch (e) {
    return { formRecord: null, error: (e as Error).message };
  }
}

// Note: copied from manage-forms actions and added revalidatePath()
export const deleteForm = async (id: string): Promise<void | { error?: string }> => {
  try {
    const { ability } = await authCheckAndThrow();

    await deleteTemplate(ability, id).catch((error) => {
      if (error instanceof TemplateHasUnprocessedSubmissions) {
        throw new Error("Responses Exist");
      } else {
        throw new Error("Failed to Delete Form");
      }
    });

    revalidatePath("(gcforms)/[locale]/(form administration)/forms", "page");
  } catch (e) {
    return { error: (e as Error).message };
  }
};
