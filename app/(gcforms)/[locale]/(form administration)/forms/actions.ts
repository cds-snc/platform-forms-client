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
import { logMessage } from "@lib/logger";

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

export const deleteForm = async (id: string) => {
  const ability = await authCheck();
  const result = await deleteTemplate(ability, id).catch((error) => {
    logMessage.error(error);
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Found unprocessed submissions");
    }
    throw new Error("Failed to Delete Form");
  });
  if (!result) {
    throw new Error("Template with user not found");
  }
  revalidatePath("(gcforms)/[locale]/(form administration)/forms", "page");
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
