"use server";
import { cache } from "react";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { listAllSubmissions } from "@lib/vault";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { deleteTemplate } from "@lib/templates";
import { TemplateHasUnprocessedSubmissions } from "@lib/templates";
import { getAppSetting } from "@lib/appSettings";
import { revalidatePath } from "next/cache";

export const authCheck = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
});

export const overdueSettings = cache(async () => {
  const promptPhaseDays = await getAppSetting("nagwarePhasePrompted");
  const warnPhaseDays = await getAppSetting("nagwarePhaseWarned");
  const responseDownloadLimit = await getAppSetting("responseDownloadLimit");
  return { promptPhaseDays, warnPhaseDays, responseDownloadLimit };
});

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

export const deleteForm = async (id: string) => {
  const ability = await authCheck();

  try {
    await deleteTemplate(ability, id);
    revalidatePath("app/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-forms");
  } catch (error) {
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Responses Exist");
    } else {
      throw new Error("Failed to Delete Form");
    }
  }
};
