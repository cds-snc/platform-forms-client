"use server";

import { PublicFormRecord, Responses, SubmissionRequestBody } from "@lib/types";
import { buildFormDataObject } from "./lib/buildFormDataObject";
import { parseRequestData } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { MissingFormDataError } from "./lib/exceptions";
import { logMessage } from "@lib/logger";
import { checkIfClosed, getPublicTemplateByID } from "@lib/templates";
import { dateHasPast } from "@lib/utils";
import { FormStatus } from "@gcforms/types";

// import { validateResponses } from "@lib/validation/validation";

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
  formRecordOrId: PublicFormRecord | string
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

    // const validateResponsesResult = await validateResponses(values, template);

    // if (Object.keys(validateResponsesResult).length !== 0) {

    /*
      logMessage.warn(
        `[server-action][submitForm] Detected invalid response(s) in submission on form ${formId}. Errors: ${JSON.stringify(
          validateResponsesResult
        )}`
      );
      */

    // Turn this on after we've monitored the logs for a while
    // throw new MissingFormDataError("Form data validation failed");
    //}

    const formDataObject = buildFormDataObject(template, values);

    if (Object.entries(formDataObject).length <= 2) {
      throw new MissingFormDataError("No form data submitted with request");
    }

    const data = await parseRequestData(formDataObject as SubmissionRequestBody);

    const submissionId = await processFormData(data.fields, data.files, language);

    return { id: formId, submissionId };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formId}. Received error: ${(e as Error).message}`
    );

    return { id: formId, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}
