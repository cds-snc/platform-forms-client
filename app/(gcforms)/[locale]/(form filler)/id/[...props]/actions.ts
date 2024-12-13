"use server";
import { PublicFormRecord, Responses, SubmissionRequestBody } from "@lib/types";
import { buildFormDataObject } from "./lib/buildFormDataObject";
import { parseRequestData } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { MissingFormDataError, MissingFormIdError } from "./lib/exceptions";
import { logMessage } from "@lib/logger";

class ServerActionChangedError extends Error {
  constructor() {
    super("Failed to find Server Action. Please try again.");
    this.name = "ServerActionChangedError";
  }
}

export async function submitForm(
  values: Responses,
  language: string,
  formRecord: PublicFormRecord
): Promise<{ id: string; error?: Error }> {
  try {
    const formDataObject = buildFormDataObject(formRecord, values);

    if (!formDataObject.formID) {
      throw new MissingFormIdError("No form ID submitted with request");
    }

    if (Object.entries(formDataObject).length <= 2) {
      throw new MissingFormDataError("No form data submitted with request");
    }

    if (Math.random() < 0.5) {
      throw new ServerActionChangedError();
    }

    const data = await parseRequestData(formDataObject as SubmissionRequestBody);

    await processFormData(data.fields, data.files, language);

    return { id: formRecord.id };
  } catch (e) {
    logMessage.error(
      `Could not submit response for form ${formRecord.id}. Received error: ${(e as Error).message}`
    );

    return { id: formRecord.id, error: { name: (e as Error).name, message: (e as Error).message } };
  }
}
