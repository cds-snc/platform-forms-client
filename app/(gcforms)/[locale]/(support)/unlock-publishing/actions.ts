"use server";
import { auth } from "@lib/auth";
import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { redirect } from "next/navigation";
import { custom, email, minLength, maxLength, object, safeParse, string } from "valibot";
import { isValidGovEmail } from "@lib/validation";

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
}

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
      minLength(1, t("input-validation.required", { ns: "common" })),
      email(t("input-validation.email", { ns: "common" })),
      custom(
        (email) => isValidGovEmail(email),
        t("input-validation.validGovEmail", { ns: "common" })
      ),
      custom(
        (email) => email?.toUpperCase() != userEmail?.toUpperCase(),
        t("input-validation.notSameAsUserEmail", { ns: "common" })
      ),
    ]),
    department: string([
      minLength(1, t("input-validation.required", { ns: "common" })),
      maxLength(50, t("signUpRegistration.fields.name.error.maxLength")),
    ]),
    goals: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
  });

  return safeParse(SupportSchema, formEntries);
};

export async function publishing(
  language: string,
  userEmail: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  const session = await auth();
  if (!session) throw new Error("No session");

  const { managerEmail, department, goals } = <
    { managerEmail: string; department: string; goals: string }
  >Object.fromEntries(formData.entries());
  const result = await validate(language, userEmail, { managerEmail, department, goals });

  if (!result.success) {
    return {
      validationErrors: result.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

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
    const result = await createTicket({
      type: "publishing",
      name: session.user.name,
      email: session.user.email,
      description: emailBody,
      language: language,
    });
    if (result?.status >= 400) {
      throw new Error(
        `Freshdesk error: ${JSON.stringify(result)} - ${session.user.email} - ${emailBody}`
      );
    }
  } catch (error) {
    logMessage.error(error);
    throw new Error("Failed to send request");
  }

  // Success
  redirect(`/${language}/unlock-publishing?success`);
}
