"use server";

import {
  TemplateHasUnprocessedSubmissions,
  deleteTemplate,
  getFullTemplateByID,
} from "@lib/templates";
import { revalidatePath } from "next/cache";
import { listAllSubmissions } from "@lib/vault";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { cache } from "react";
import { getAppSetting } from "@lib/appSettings";
import { FormRecord, NagwareResult } from "@lib/types";
import { authCheck } from "@lib/actions";

export async function getForm(
  formId: string
): Promise<{ formRecord: FormRecord | null; error?: string }> {
  try {
    const { ability } = await authCheck();
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
    const { ability } = await authCheck();

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

const overdueSettings = cache(async () => {
  const promptPhaseDays = await getAppSetting("nagwarePhasePrompted");
  const warnPhaseDays = await getAppSetting("nagwarePhaseWarned");
  const responseDownloadLimit = await getAppSetting("responseDownloadLimit");
  return { promptPhaseDays, warnPhaseDays, responseDownloadLimit };
});

// Note: copied from manage-forms actions
export const getUnprocessedSubmissionsForTemplate = async (
  templateId: string
): Promise<{ result: NagwareResult | null; error?: string }> => {
  try {
    const { ability } = await authCheck();
    const { promptPhaseDays, warnPhaseDays, responseDownloadLimit } = await overdueSettings();
    const allSubmissions = await listAllSubmissions(
      ability,
      templateId,
      undefined,
      Number(responseDownloadLimit)
    );
    const result = await detectOldUnprocessedSubmissions(
      allSubmissions.submissions,
      promptPhaseDays,
      warnPhaseDays
    );
    return { result };
  } catch (e) {
    return { result: null, error: (e as Error).message };
  }
};
