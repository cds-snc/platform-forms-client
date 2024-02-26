"use server";
import { cache } from "react";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { listAllSubmissions } from "@lib/vault";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { getAppSetting } from "@lib/appSettings";
import { deleteTemplate } from "@lib/templates";
import { TemplateHasUnprocessedSubmissions } from "@lib/templates";

export const authCheck = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
});

export const getUnprocessedSubmissionsForTemplate = async (templateId: string) => {
  const ability = await authCheck();
  const allSubmissions = await listAllSubmissions(ability, templateId);

  return detectOldUnprocessedSubmissions(allSubmissions.submissions);
};

export const getSetting = cache(async (setting: string) => {
  return getAppSetting(setting);
});

export const deleteForm = async (id: string) => {
  const ability = await authCheck();
  return deleteTemplate(ability, id).catch((error) => {
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Responses Exist");
    } else {
      throw new Error("Failed to Delete Form");
    }
  });
};
