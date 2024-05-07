"use server";
import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { redirect } from "next/navigation";
import { email, minLength, object, safeParse, string, toLowerCase, toTrimmed } from "valibot";

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
  const { t } = await serverTranslation(["common"], { lang: language });

  const SupportSchema = object({
    name: string([minLength(1, t("input-validation.required"))]),
    email: string([
      toLowerCase(),
      toTrimmed(),
      minLength(1, t("input-validation.required")),
      email(t("input-validation.email")),
    ]),
    // radio input can send a non-string value when empty
    request: string(t("input-validation.required"), [minLength(1, t("input-validation.required"))]),
    description: string([minLength(1, t("input-validation.required"))]),
  });

  return safeParse(SupportSchema, formEntries, { abortPipeEarly: true });
};

export async function support(
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = await validate(language, rawData);

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

  try {
    await createTicket({
      type: "problem",
      name,
      email,
      description: emailBody,
      language,
    });
  } catch (error) {
    logMessage.error(error);
    throw new Error("Internal Service Error: Failed to send request");
  }

  // Success
  redirect(`/${language}/support?success`);
}
