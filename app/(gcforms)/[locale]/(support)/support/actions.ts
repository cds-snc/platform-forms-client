"use server";

import { serverTranslation } from "@i18n";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import {
  email,
  minLength,
  object,
  safeParse,
  string,
  toLowerCase,
  trim,
  pipe,
  check,
} from "valibot";
import { isValidGovEmail } from "@lib/validation/validation";

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
  logMessage.info("Parsing support form data");
  const rawData = Object.fromEntries(formData.entries());
  logMessage.info("Validating support form data");
  const validatedData = await validate(language, rawData).catch((e) => {
    logMessage.warn(`Failed to validate support form: ${(e as Error).message}`);
    logMessage.info(JSON.stringify(rawData));

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
    const { t } = await serverTranslation(["common"], { lang: language });
    return { error: t("errors.internalServiceError"), validationErrors: [] };
  }
  return { error: "", validationErrors: [] };
}

export async function browserCompatibilitySupport(
  language: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> {
  logMessage.info("Processing browser compatibility support request");
  const rawData = Object.fromEntries(formData.entries());

  const validatedData = await validateBrowserSupport(language, rawData).catch((e) => {
    logMessage.warn(`Failed to validate browser support form: ${(e as Error).message}`);
    logMessage.info(JSON.stringify(rawData));
    return { success: false, issues: [] } as unknown as ReturnType<typeof validateBrowserSupport>;
  });

  if (!validatedData.success) {
    return {
      validationErrors: validatedData.issues.map((issue) => ({
        fieldKey: issue.path?.[0].key as string,
        fieldValue: issue.message,
      })),
    };
  }

  const { email, browserData } = validatedData.output;

  // Parse browser data
  let browserInfo;
  try {
    browserInfo = JSON.parse(browserData as string);
  } catch {
    browserInfo = { browser: "Unknown", testResults: "Unable to parse test data" };
  }

  const emailBody = `
User (${email}) has reported browser compatibility issues with File System Access API.<br/>
<br/>
Browser Information:<br/>
- Browser: ${browserInfo.browser || "Unknown"}<br/>
- User Agent: ${browserInfo.userAgent || "Not provided"}<br/>
- File System Access Support: ${browserInfo.hasFileSystemAccess ? "Supported" : "Not Supported"}<br/>
<br/>
Test Results:<br/>
${JSON.stringify(browserInfo.testResults, null, 2).replace(/\n/g, "<br/>")}.<br/>
<br/>
****<br/>
L'utilisateur (${email}) a signalé des problèmes de compatibilité de navigateur avec l'API d'accès au système de fichiers.<br/>
<br/>
Informations sur le navigateur:<br/>
- Navigateur: ${browserInfo.browser || "Inconnu"}<br/>
- Agent utilisateur: ${browserInfo.userAgent || "Non fourni"}<br/>
- Support de l'accès au système de fichiers: ${browserInfo.hasFileSystemAccess ? "Supporté" : "Non supporté"}<br/>
<br/>
Résultats des tests:<br/>
${JSON.stringify(browserInfo.testResults, null, 2).replace(/\n/g, "<br/>")}.<br/>
`;

  logMessage.info(`Creating browser compatibility support ticket for ${email}`);
  try {
    await createTicket({
      type: "problem",
      name: "Browser Compatibility Issue",
      email,
      description: emailBody,
      language,
    });
  } catch (error) {
    logMessage.error(`Failed to send browser compatibility request: ${(error as Error).message}`);
    const { t } = await serverTranslation(["common"], { lang: language });
    return { error: t("errors.internalServiceError"), validationErrors: [] };
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

const validateBrowserSupport = async (
  language: string,
  formEntries: {
    [k: string]: FormDataEntryValue;
  }
) => {
  const { t } = await serverTranslation(["common"], { lang: language });

  const BrowserSupportSchema = object({
    email: pipe(
      string(),
      toLowerCase(),
      trim(),
      minLength(1, t("input-validation.required")),
      email(t("input-validation.email")),
      check((email) => isValidGovEmail(email), t("input-validation.validGovEmail"))
    ),
    browserData: pipe(string(), minLength(1, "Browser data required")),
  });

  return safeParse(BrowserSupportSchema, formEntries, { abortPipeEarly: true });
};
