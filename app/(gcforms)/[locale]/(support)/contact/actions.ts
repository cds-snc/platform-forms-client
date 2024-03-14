"use server";
import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { redirect } from "next/navigation";
import { email, minLength, object, safeParse, string } from "valibot";

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
}

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
      minLength(1, t("input-validation.required", { ns: "common" })),
      email(t("input-validation.email", { ns: "common" })),
    ]),
    department: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
    // Note: branch and jobTitle are not required/validated
  });

  return safeParse(SupportSchema, formEntries);
};

export async function contact(
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  const { request, description, name, email, department, branch, jobTitle } = <
    {
      request: string;
      description: string;
      name: string;
      email: string;
      department: string;
      branch: string;
      jobTitle: string;
    }
  >Object.fromEntries(formData.entries());
  const result = await validate(language, {
    request,
    description,
    name,
    email,
    department,
    branch,
    jobTitle,
  });

  if (!result.success) {
    return {
      validationErrors: result.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

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

  try {
    const result = await createTicket({
      type: "contact",
      name,
      email,
      description: emailBody,
      language,
    });
    if (result?.status >= 400) {
      throw new Error(`Freshdesk error: ${JSON.stringify(result)} - ${email} - ${emailBody}`);
    }
  } catch (error) {
    logMessage.error(error);
    throw new Error("Internal Service Error: Failed to send request");
  }

  // Success
  redirect(`/${language}/contact?success`);
}
