"use server";

import { PublicFormRecord, Responses } from "@lib/types";

import { buildCompleteFormDataObject } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { logMessage } from "@lib/logger";
import { checkIfClosed, getPublicTemplateByID } from "@lib/templates";
import { dateHasPast } from "@lib/utils";
import { FormStatus } from "@gcforms/types";
import { verifyHCaptchaToken } from "@lib/validation/hCaptcha";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { validateResponses } from "@lib/validation/validation";
import { sendNotifications } from "@lib/notifications";
import { generateSignedUrl } from "@lib/s3-upload";

//  Removed once hCaptcha is running in blockable mode https://github.com/cds-snc/platform-forms-client/issues/5401
const CAPTCHA_BLOCKABLE_MODE = false;

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
  captchaToken?: string | undefined
): Promise<{ id: string; submissionId?: string; error?: Error }> {
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
    if (template?.isPublished) {
      // hCaptcha runs regardless but only block submissions if the feature flag is enabled
      const captchaVerified = await verifyHCaptchaToken(captchaToken || "");
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

    const validateResponsesResult = await validateResponses(values, template);

    if (Object.keys(validateResponsesResult).length !== 0) {
      // See: https://gcdigital.slack.com/archives/C05G766KW49/p1737063028759759
      logMessage.info(
        `[server-action][submitForm] Detected invalid response(s) in submission on form ${formId}. Errors: ${JSON.stringify(
          validateResponsesResult
        )}`
      );
      // Turn this on after we've monitored the logs for a while
      // throw new MissingFormDataError("Form data validation failed");
    }

    const { formData, fileKeys } = buildCompleteFormDataObject(template, values);

    const submissionId = await processFormData(formData, fileKeys, language, fileKeys.length > 0);

    sendNotifications(formId, template.form.titleEn, template.form.titleFr);

    return { id: formId, submissionId };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formId}. Received error: ${(e as Error).message}`
    );

    return { id: formId, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}

export const getSignedS3Urls = async (files: string[]) =>
  Promise.all(files.map(async (file) => generateSignedUrl(file)));
