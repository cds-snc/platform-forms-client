"use server";
import { PublicFormRecord, Responses, SubmissionRequestBody } from "@lib/types";
import { buildFormDataObject } from "./lib/buildFormDataObject";
import { parseRequestData } from "./lib/parseRequestData";
import { processFormData } from "./lib/processFormData";
import { MissingFormDataError, MissingFormIdError } from "./lib/exceptions";

export async function submitForm(
  values: Responses,
  language: string,
  formRecord: PublicFormRecord
) {
  const formDataObject = buildFormDataObject(formRecord, values);

  if (!formDataObject.formID) {
    throw new MissingFormIdError("No form ID submitted with request");
  }

  if (Object.entries(formDataObject).length <= 2) {
    throw new MissingFormDataError("No form data submitted with request");
  }

  const data = await parseRequestData(formDataObject as SubmissionRequestBody);

  await processFormData(data.fields, data.files, language);

  return formRecord.id;
}
