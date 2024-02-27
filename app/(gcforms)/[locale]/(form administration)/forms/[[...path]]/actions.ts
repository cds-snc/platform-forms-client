"use server";
import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import {
  TemplateHasUnprocessedSubmissions,
  deleteTemplate,
  getFullTemplateByID,
} from "@lib/templates";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { listAllSubmissions } from "@lib/vault";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { cache } from "react";

class MalformedAPIRequest extends Error {}

// Note: copied from manage-forms actions
export const authCheck = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
});

export async function getForm(formId: string) {
  try {
    if (!formId || typeof formId !== "string") {
      throw new MalformedAPIRequest("Invalid or missing formID");
    }

    const ability = await authCheck();

    const response = await getFullTemplateByID(ability, formId);
    if (response === null) {
      throw new Error(
        `Template API response was null. Request information: query = ${JSON.stringify(formId)}`
      );
    }

    return response;
  } catch (e) {
    const error = e as Error;
    if (e instanceof AccessControlError) {
      logMessage.error("Forbidden");
      throw Error("Forbidden");
    } else if (e instanceof MalformedAPIRequest) {
      logMessage.error(`Malformed API Request. Reason: ${error.message}.`);
      throw Error(`Malformed API Request. Reason: ${error.message}.`);
    } else {
      logMessage.error(`Internal server error. Reason: ${error.message}.`);
      throw Error(`Internal server error. Reason: ${error.message}.`);
    }
  }
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

// Note: copied from manage-forms actions
export const getUnprocessedSubmissionsForTemplate = async (templateId: string) => {
  const ability = await authCheck();
  const allSubmissions = await listAllSubmissions(ability, templateId);

  return detectOldUnprocessedSubmissions(allSubmissions.submissions);
};
