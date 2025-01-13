"use server";

import { Responses, SubmissionRequestBody } from "@lib/types";
import { buildFormDataObject } from "./lib/buildFormDataObject";
import { parseRequestData } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { MissingFormDataError, MissingFormIdError } from "./lib/exceptions";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { validateResponses } from "@lib/validation/validation";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function submitForm(
  values: Responses,
  language: string,
  formId: string
): Promise<{ id: string; error?: Error }> {
  try {
    const formRecord = await getPublicTemplateByID(formId);

    if (!formRecord) {
      throw new Error("Form data validation failed");
    }
    const validateOnSubmitResult = await validateResponses({
      values,
      formRecord,
      language,
    });

    if (Object.keys(validateOnSubmitResult).length !== 0) {
      throw new MissingFormDataError("Form data validation failed");
    }

    const formDataObject = buildFormDataObject(formRecord, values);

    if (!formDataObject.formID) {
      throw new MissingFormIdError("No form ID submitted with request");
    }

    if (Object.entries(formDataObject).length <= 2) {
      throw new MissingFormDataError("No form data submitted with request");
    }

    const data = await parseRequestData(formDataObject as SubmissionRequestBody);

    await processFormData(data.fields, data.files, language);

    return { id: formRecord.id };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formId}. Received error: ${(e as Error).message}`
    );

    return { id: formId, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}
