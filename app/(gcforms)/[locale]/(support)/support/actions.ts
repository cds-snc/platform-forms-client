"use server";

import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { email, minLength, object, safeParse, string, toLowerCase, trim, pipe } from "valibot";

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function support(
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  const rawFormData = Object.fromEntries(formData.entries());

  if (!rawFormData.request) {
    // Avoids undefined value for request field
    rawFormData.request = "";
  }

  const validatedData = await validate(language, rawFormData).catch((e) => {
    logMessage.warn(`Failed to validate support form: ${(e as Error).message}`);
    return { success: false, issues: [] } as unknown as ReturnType<typeof validate>;
  });

  if (!validatedData.success) {
    return {
      validationErrors: validatedData.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  const { name, email, request, description } = validatedData.output;

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
${name} (${email}) has requested support for the form-builder.<br/>
<br/>
Support request:<br/>
${requestParsed}<br/>
<br/>
Additional details:<br/>
${description}<br/>
<br/>
****<br/>
${name} (${email}) a demandé de soutien des form-builder.<br/>
<br/>
Demande de soutien:<br/>
${requestParsed}<br/>
<br/>
Détails supplémentaires:<br/>
${description}<br/>
`;
  logMessage.info(`Creating support ticket for ${email}`);
  try {
    await createTicket({
      type: "problem",
      name,
      email,
      description: emailBody,
      language,
    });
  } catch (error) {
    logMessage.error(`Failed to send support request: ${(error as Error).message}`);
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
  const { t } = await serverTranslation(["common"], { lang: language });

  const SupportSchema = object({
    name: pipe(string(), minLength(1, t("input-validation.required"))),
    email: pipe(
      string(),
      toLowerCase(),
      trim(),
      minLength(1, t("input-validation.required")),
      email(t("input-validation.email"))
    ),
    // radio input can send a non-string value when empty
    request: pipe(
      string(t("input-validation.required")),
      minLength(1, t("input-validation.required"))
    ),
    description: pipe(string(), minLength(1, t("input-validation.required"))),
  });

  return safeParse(SupportSchema, formEntries, { abortPipeEarly: true });
};
