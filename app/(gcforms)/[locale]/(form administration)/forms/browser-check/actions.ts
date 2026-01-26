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
${JSON.stringify(browserInfo.testResults, null, 2).replace(/\n/g, "<br/>")}<br/>
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
${JSON.stringify(browserInfo.testResults, null, 2).replace(/\n/g, "<br/>")}<br/>
`;

  logMessage.info(`Creating browser compatibility support ticket for ${email}`);
  try {
    logMessage.info(emailBody);

    await createTicket({
      type: "problem",
      name: "Browser Compatibility Issue",
      email,
      description: emailBody,
      language,
    });
  } catch (error) {
    logMessage.error(`Failed to send browser compatibility request: ${(error as Error).message}`);
    return { error: "Internal Service Error: Failed to send request", validationErrors: [] };
  }

  return { error: "", validationErrors: [] };
}

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
