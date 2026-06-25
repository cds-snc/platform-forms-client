"use server";

import { PublicFormRecord, Responses, SignedURLMap } from "@lib/types";
import { normalizeFormResponses } from "./lib/server/normalizeFormResponses";
import { processFormData } from "./lib/server/processFormData";
import { logMessage } from "@lib/logger";
import { getTemplateClosureState } from "@lib/templates/queries/getTemplateClosureState";
import { getPublicTemplateByID } from "@lib/templates/queries/getPublicTemplateByID";
import { FormStatus } from "@gcforms/types";
import { verifyHCaptchaToken } from "@lib/validation/hCaptcha";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { dateHasPast } from "@lib/utils";
import { validateVisibleElements } from "@gcforms/core";
import { serverTranslation } from "@root/i18n";
import {
  isFormEligibleForEmails,
  prepareFormSubmissionEmail,
  updateNotificationMarker,
} from "@lib/notifications";
import { sendEmail } from "@lib/integration/notifyConnector";
import { traceFunction } from "@lib/otel";

import { MissingFormDataError } from "./lib/client/exceptions";
import { valuesMatchErrorContainsElementType } from "@gcforms/core";
import { shouldCheckCaptcha } from "@lib/utils/shouldCheckCaptcha";
import { randomUUID } from "crypto";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function isFormClosed(formId: string): Promise<boolean> {
  const closedDetails = await getTemplateClosureState(formId);

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
  return traceFunction("submitForm", async () => {
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

      const shouldVerifyHCaptcha = shouldCheckCaptcha(template?.isPublished);

      if (shouldVerifyHCaptcha) {
        const hCaptchaBlockingMode = await checkOne(FeatureFlags.hCaptcha);
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
      const validateOnSubmitResult = validateVisibleElements(values, {
        formRecord: template,
        t: t,
      });

      if (Object.keys(validateOnSubmitResult.errors).length !== 0) {
        logMessage.info(
          `[server-action][submitForm] Detected validation errors on form ${formId}. Errors: ${JSON.stringify(
            validateOnSubmitResult
          )}`
        );

        // 👉 Keeping in "passive mode" for now.
        // Uncomment following line to throw validation error from server.
        // throw new MissingFormDataError("Form data validation failed");
      }

      // ⚠️ Specifically catch file input errors
      if (validateOnSubmitResult.valueMatchErrors) {
        const hasFileInputErrors = valuesMatchErrorContainsElementType(
          validateOnSubmitResult.valueMatchErrors,
          "fileInput"
        );
        if (hasFileInputErrors) {
          throw new MissingFormDataError("Form data validation failed due to file input errors");
        }
      }

      const formData = normalizeFormResponses(template, values);

      const notificationId = await scheduleFormSubmissionNotification(
        formId,
        template.form.titleEn,
        template.form.titleFr
      );

      const { submissionId, fileURLMap } = await processFormData({
        responses: formData,
        securityAttribute: template.securityAttribute,
        formId,
        language,
        fileChecksums,
        notificationId,
      });

      return { id: formId, submissionId, fileURLMap };
    } catch (e) {
      logMessage.error(
        `Could not submit response for form ${formId}. Received error: ${(e as Error).message}`
      );

      return { id: formId, error: { name: (e as Error).name, message: (e as Error).message } };
    }
  });
}

// Note: the returned notificationId is used in processFormData. Sending via the notifcation pipeline will
// only kick off is anotificationId is present in processFormData.
const scheduleFormSubmissionNotification = async (
  formId: string,
  formTitleEn: string,
  formTitleFr: string
): Promise<string | undefined> => {
  const shouldSendNotification = await isFormEligibleForEmails(formId);
  if (!shouldSendNotification) return undefined;

  const notificationEmailType = await updateNotificationMarker(formId);
  if (!notificationEmailType) return undefined;

  const emailData = await prepareFormSubmissionEmail(
    formId,
    formTitleEn,
    formTitleFr,
    notificationEmailType
  );
  if (!emailData) return undefined;

  const notificationId = randomUUID();

  logMessage.debug(
    `Sending a deferred notification: formId=${formId}, notificationId=${notificationId}, notificationEmailType=${notificationEmailType}`
  );

  // Fire-and-forget: write the deferred notification record to DynamoDB
  // The Reliability lambda will enqueue it once the submission is confirmed
  sendEmail(
    emailData.emails,
    { subject: emailData.subject, formResponse: emailData.formResponse },
    "formSubmissionNotification",
    { mode: "deferred", notificationId }
  ).catch((error) =>
    logMessage.warn(
      `sendEmail deferred notification failed for form ${formId}: ${(error as Error).message}`
    )
  );

  return notificationId;
};
