"use server";
import { cache } from "react";

import { deleteTemplate } from "@lib/templates";
import { TemplateHasUnprocessedSubmissions } from "@lib/templates";
import { getAppSetting } from "@lib/appSettings";
import { revalidatePath } from "next/cache";
import { authCheckAndThrow } from "@lib/actions";

export const overdueSettings = cache(async () => {
  const promptPhaseDays = await getAppSetting("nagwarePhasePrompted");
  const warnPhaseDays = await getAppSetting("nagwarePhaseWarned");
  const responseDownloadLimit = await getAppSetting("responseDownloadLimit");
  return { promptPhaseDays, warnPhaseDays, responseDownloadLimit };
});

export const deleteForm = async (id: string) => {
  const { ability } = await authCheckAndThrow();

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
