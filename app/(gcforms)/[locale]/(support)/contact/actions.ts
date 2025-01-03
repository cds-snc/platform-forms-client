"use server";

import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { email, minLength, object, safeParse, string, toLowerCase, toTrimmed } from "valibot";

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function contact(
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  logMessage.info("Parsing contact form data");
  const rawData = Object.fromEntries(formData.entries());
  logMessage.info("Validating contact form data");
  const result = await validate(language, rawData).catch((e) => {
    logMessage.warn(`Failed to validate contact form: ${(e as Error).message}`);
    logMessage.info(JSON.stringify(rawData));

    return { success: false, issues: [] } as unknown as ReturnType<typeof validate>;
  });

  if (!result.success) {
    return {
      validationErrors: result.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  const { name, email, department, branch, jobTitle, request, description } = result.output;

  // Request may be a list of strings (checkbox), format it a bit if so, or just a string (radio)
  const requestParsed =
    request.toString().split(",").length > 1
      ? request
          .toString()
          .split(",")
          .map((item: string) => `-${item}`)
          .join("\n")
      : request;

  const emailBody = `
${name} (${email}) has requested we contact them for the form-builder.<br/>
<br/>
Department or agency:<br/>
${department}<br/>

Branch or sector:<br/>
${branch}<br/>
<br/>
Job title:<br/>
${jobTitle}<br/>
<br/>
Contact request:<br/>
${requestParsed}<br/>
<br/>
Additional details:<br/>
${description}<br/>
<br/>
****
${name} (${email}) a demandé que nous les contactions pour le générateur de formulaires..<br/>
<br/>
Ministère ou organisme:<br/>
${department}<br/>
<br/>
Direction ou secteur:<br/>
${branch}<br/>
<br/>
Titre de poste:<br/>
${jobTitle}<br/>
<br/>
Demande de contact soutien:<br/>
${requestParsed}<br/>
<br/>
Détails supplémentaires:<br/>
${description}<br/>
`;
  logMessage.info(`Creating contact ticket for ${email}`);
  try {
    await createTicket({
      type: "contact",
      name,
      email,
      description: emailBody,
      language,
    });
  } catch (error) {
    logMessage.error(`Failed to send contact request: ${(error as Error).message}`);
    return { error: "Internal Service Error: Failed to send request", validationErrors: [] };
  }
  return { error: "", validationErrors: [] };
}

// Internal and private functions - won't be converted into server actions

const validate = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["signup", "common"], { lang: language });

  const SupportSchema = object({
    // checkbox input can send a non-string value when empty
    request: string(t("input-validation.required", { ns: "common" }), [
      minLength(1, t("input-validation.required", { ns: "common" })),
    ]),
    description: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
    name: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
    email: string([
      toLowerCase(),
      toTrimmed(),
      minLength(1, t("input-validation.required", { ns: "common" })),
      email(t("input-validation.email", { ns: "common" })),
    ]),
    department: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
    // Note: branch and jobTitle are not required/validated
    branch: string(),
    jobTitle: string(),
  });

  return safeParse(SupportSchema, formEntries, { abortPipeEarly: true });
};
