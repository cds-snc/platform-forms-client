"use server";
import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { logMessage } from "@lib/logger";

class MalformedAPIRequest extends Error {}

export async function getForm(formId: string) {
  try {
    if (!formId || typeof formId !== "string") {
      throw new MalformedAPIRequest("Invalid or missing formID");
    }

    const session = await auth();
    if (!session) throw new Error("No session");
    const ability = createAbility(session);

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
