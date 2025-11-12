"use server";

import {
  TemplateHasUnprocessedSubmissions,
  deleteTemplate,
  getFullTemplateByID,
  cloneTemplate,
  restoreTemplate,
} from "@lib/templates";
import { revalidatePath } from "next/cache";
import { FormRecord } from "@lib/types";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getForm = AuthenticatedAction(
  async (
    _,
    formId: string,
    allowDeleted: boolean
  ): Promise<{ formRecord: FormRecord | null; error?: string }> => {
    try {
      const response = await getFullTemplateByID(formId, allowDeleted).catch(() => {
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
);

// Note: copied from manage-forms actions and added revalidatePath()
export const deleteForm = AuthenticatedAction(
  async (_, id: string): Promise<void | { error?: string }> => {
    try {
      await deleteTemplate(id).catch((error) => {
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
  }
);

export const restoreForm = AuthenticatedAction(
  async (_, id: string): Promise<void | { error?: string }> => {
    try {
      await restoreTemplate(id).catch((error) => {
        if (error) {
          throw new Error("Failed to Restore Form");
        }
      });

      revalidatePath("(gcforms)/[locale]/(form administration)/forms", "page");
    } catch (e) {
      return { error: (e as Error).message };
    }
  }
);

export const cloneForm = AuthenticatedAction(
  async (_, id: string): Promise<{ formRecord: FormRecord | null; error?: string }> => {
    try {
      const cloned = await cloneTemplate(id);

      if (!cloned) throw new Error("Failed to clone template");

      // Revalidate forms listing so the new cloned template appears
      revalidatePath("(gcforms)/[locale]/(form administration)/forms", "page");

      return { formRecord: cloned };
    } catch (e) {
      return { formRecord: null, error: (e as Error).message };
    }
  }
);
