"use server";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
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

// Note: copied from manage-forms actions
export const authCheck = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
});

export async function getForm(formId: string) {
  const ability = await authCheck();
  const response = await getFullTemplateByID(ability, formId).catch(() => {
    throw new Error("Failed to Get Form");
  });
  if (response === null) {
    throw new Error("Form Not Found");
  }
  return response;
}

// Note: copied from manage-forms actions and added revalidatePath()
export const deleteForm = async (id: string) => {
  const ability = await authCheck();

  const result = deleteTemplate(ability, id).catch((error) => {
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Responses Exist");
    } else {
      throw new Error("Failed to Delete Form");
    }
  });

  revalidatePath("(gcforms)/[locale]/(form administration)/forms");

  return result;
};

const overdueSettings = cache(async () => {
  const promptPhaseDays = await getAppSetting("nagwarePhasePrompted");
  const warnPhaseDays = await getAppSetting("nagwarePhaseWarned");
  const responseDownloadLimit = await getAppSetting("responseDownloadLimit");
  return { promptPhaseDays, warnPhaseDays, responseDownloadLimit };
});

// Note: copied from manage-forms actions
export const getUnprocessedSubmissionsForTemplate = async (templateId: string) => {
  const ability = await authCheck();
  const { promptPhaseDays, warnPhaseDays, responseDownloadLimit } = await overdueSettings();
  const allSubmissions = await listAllSubmissions(
    ability,
    templateId,
    undefined,
    Number(responseDownloadLimit)
  );
  return detectOldUnprocessedSubmissions(
    allSubmissions.submissions,
    promptPhaseDays,
    warnPhaseDays
  );
};
