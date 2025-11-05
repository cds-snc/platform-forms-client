"use server";

import { PublicFormRecord, Responses, SignedURLMap } from "@lib/types";
import { normalizeFormResponses } from "./lib/server/normalizeFormResponses";
import { processFormData } from "./lib/server/processFormData";
import { logMessage } from "@lib/logger";
import { checkIfClosed, getPublicTemplateByID } from "@lib/templates";
import { FormStatus } from "@gcforms/types";
import { verifyHCaptchaToken } from "@lib/validation/hCaptcha";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { dateHasPast } from "@lib/utils";
import { validateOnSubmit } from "@gcforms/core";
import { serverTranslation } from "@root/i18n";
import { sendNotifications } from "@lib/notifications";
import { MissingFormDataError } from "./lib/client/exceptions";
// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function isFormClosed(formId: string): Promise<boolean> {
  const closedDetails = await checkIfClosed(formId);

  if (closedDetails && closedDetails.isPastClosingDate) {
    return true;
  }

  return false;
}

export async function submitForm(
  values: Responses,
  language: string,
  formRecordOrId: PublicFormRecord | string,
  captchaToken?: string | undefined,
  fileChecksums?: Record<string, string>
): Promise<{
  id: string;
  submissionId?: string;
  error?: Error;
  fileURLMap?: SignedURLMap;
}> {
  const formId = typeof formRecordOrId === "string" ? formRecordOrId : formRecordOrId.id;

  try {
    const template = await getPublicTemplateByID(formId);

    if (!template) {
      throw new Error(`Could not find any form associated to identifier ${formId}`);
    }

    if (template.closingDate && dateHasPast(Date.parse(template.closingDate))) {
      return {
        id: formId,
        error: { name: FormStatus.FORM_CLOSED_ERROR, message: "Form is closed" },
      };
    }

    const hCaptchaBlockingMode = await checkOne(FeatureFlags.hCaptcha);
    // Skip hCaptcha verification for form-builder Preview (drafts)
    if (template?.isPublished && process.env.APP_ENV !== "test") {
      // hCaptcha runs regardless but only block submissions if the feature flag is enabled
      const captchaVerified = await verifyHCaptchaToken(captchaToken || "", formId);
      if (hCaptchaBlockingMode && !captchaVerified) {
        return {
          id: formId,
          error: {
            name: FormStatus.CAPTCHA_VERIFICATION_ERROR,
            message: "Captcha verification failure",
          },
        };
      }
    }

    const { t } = await serverTranslation();

    /**
     * This validation runs the client-side validation on the server.
     */
    const validateOnSubmitResult = validateOnSubmit(values, {
      formRecord: template,
      t: t,
    });

    if (Object.keys(validateOnSubmitResult).length !== 0) {
      logMessage.info(
        `[server-action][submitForm] Detected validation errors on form ${formId}. Errors: ${JSON.stringify(
          validateOnSubmitResult
        )}`
      );

      // ⚠️ Specifically  catch file input errors
      const fileInputErrors = Object.keys(validateOnSubmitResult).filter((key) =>
        key.startsWith("fileInput")
      );

      if (fileInputErrors.length > 0) {
        // pass an empty ArrayBuffer as the file content so the FileUploadError's
        // `file` argument matches the expected FileInput type
        throw new MissingFormDataError("Form data validation failed");
      }

      // 👉 Keeping in "passive mode" for now.
      // Uncomment following line to throw validation error from server.
      // throw new MissingFormDataError("Form data validation failed");
    }

    const formData = normalizeFormResponses(template, values);

    const { submissionId, fileURLMap } = await processFormData({
      responses: formData,
      securityAttribute: template.securityAttribute,
      formId,
      language,
      fileChecksums,
    });

    sendNotifications(formId, template.form.titleEn, template.form.titleFr);

    return { id: formId, submissionId, fileURLMap };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formId}. Received error: ${(e as Error).message}`
    );

    return { id: formId, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}
