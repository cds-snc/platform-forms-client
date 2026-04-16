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
import type { ErrorStates, TestResult } from "./types";

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

  // Helper function to generate test results table
  const generateTestResultsTable = (testResults: Record<string, TestResult | null>) => {
    const testNames = [
      "fileSystemAPI",
      "directoryPicker",
      "readWritePermission",
      "readOnlyPermission",
      "createFile",
      "writeFile",
      "readFile",
      "cleanUp",
    ];

    let tableHTML = `
    <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
      <tr style="background-color: #f0f0f0;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test Name</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Status</th>
      </tr>
    `;

    testNames.forEach((testName) => {
      const result = testResults[testName];
      const status =
        result === true
          ? '<span style="color: green; font-weight: bold;">✓ Pass</span>'
          : result?.message
            ? '<span style="color: red; font-weight: bold;">✗ Fail</span>'
            : '<span style="color: #999;">-</span>';

      tableHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${testName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${status}</td>
      </tr>
    `;
    });

    tableHTML += `</table>`;
    return tableHTML;
  };

  const emailBody = `
User (${email}) has reported browser compatibility issues with File System Access API.<br/>
<br/>
Test Results:<br/>
${generateTestResultsTable(browserInfo.testResults)}<br/>
<br/>
Browser Information:<br/>
- Browser: ${browserInfo.browser || "Unknown"}<br/>
- User Agent: ${browserInfo.userAgent || "Not provided"}<br/>
<br/>
****<br/>
L'utilisateur (${email}) a signalé des problèmes de compatibilité de navigateur avec l'API d'accès au système de fichiers.<br/>
<br/>
Résultats des tests:<br/>
${generateTestResultsTable(browserInfo.testResults)}<br/>
<br/>
Informations sur le navigateur:<br/>
- Navigateur: ${browserInfo.browser || "Inconnu"}<br/>
- Agent utilisateur: ${browserInfo.userAgent || "Non fourni"}<br/>
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
