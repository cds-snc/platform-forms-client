"use server";

import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import {
  custom,
  email,
  minLength,
  maxLength,
  object,
  safeParse,
  string,
  toLowerCase,
  toTrimmed,
} from "valibot";
import { isValidGovEmail } from "@lib/validation/validation";
import { AuthenticatedAction } from "@lib/actions";
import { authorization } from "@lib/privileges";

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const unlockPublishing = AuthenticatedAction(
  async (session, language: string, userEmail: string, _: ErrorStates, formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = await validate(language, userEmail, rawData);

    if (!validatedData.success) {
      return {
        validationErrors: validatedData.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      };
    }

    const { managerEmail, department, goals } = validatedData.output;

    const emailBody = `
    ${session.user.name} (${session.user.email}) from ${department} has requested permission to publish forms.<br/>
    <br/>
    Goals:<br/>
    ${goals}<br/>
    <br/>
    Manager email address: ${managerEmail} .<br/><br/>
    ****<br/><br/>
    ${session.user.name} (${session.user.email}) du ${department} a demandé l'autorisation de publier des formulaires.<br/>
    <br/>
    Objectifs:<br/>
    ${goals}<br/>
    <br/>
    Adresse email du responsable: ${managerEmail} .<br/>
    `;

    if (!session.user.name || !session.user.email) {
      throw new Error("User name or email not found");
    }

    try {
      const userHasPermissionToPublishForms = await authorization.hasPermissionToPublishForms();
      if (userHasPermissionToPublishForms)
        throw new Error("Permissiong to publish forms has already been granted");

      await createTicket({
        type: "publishing",
        name: session.user.name,
        email: session.user.email,
        description: emailBody,
        language: language,
      });
    } catch (error) {
      logMessage.error(`Failed to unlock publishing: ${(error as Error).message}`);
      return { error: "Failed to send request", validationErrors: [] };
    }

    return { error: "", validationErrors: [] };
  }
);

// Internal and private functions - won't be converted into server actions

const validate = async (
  language: string,
  userEmail: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["unlock-publishing", "common"], { lang: language });

  const SupportSchema = object({
    managerEmail: string([
      toLowerCase(),
      toTrimmed(),
      minLength(1, t("input-validation.required", { ns: "common" })),
      email(t("input-validation.email", { ns: "common" })),
      custom(
        (email) => isValidGovEmail(email),
        t("input-validation.validGovEmail", { ns: "common" })
      ),
      custom(
        (email) => email?.toLowerCase() != userEmail?.toLowerCase(),
        t("input-validation.notSameAsUserEmail", { ns: "common" })
      ),
    ]),
    department: string([
      minLength(1, t("input-validation.required", { ns: "common" })),
      maxLength(50, t("signUpRegistration.fields.name.error.maxLength")),
    ]),
    goals: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
  });

  return safeParse(SupportSchema, formEntries, { abortPipeEarly: true });
};
