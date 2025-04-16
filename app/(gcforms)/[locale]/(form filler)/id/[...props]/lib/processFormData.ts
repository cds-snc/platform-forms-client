import { Response } from "@lib/types";
import { ProcessedFile } from "@lib/types/submission-types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { deleteObject } from "@lib/s3-upload";
import { transformFormResponses } from "./transformFormResponses";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import { FormIsClosedError, FormNotFoundError, MissingFormDataError } from "./exceptions";
import { handleUpload, type FilesKeyUrlMap } from "./upload";

export const processFormData = async (
  reqFields: Record<string, Response>,
  files: Record<string, ProcessedFile | ProcessedFile[]>,
  contentLanguage: string
): Promise<string> => {
  const uploadedFilesKeyUrlMapping: FilesKeyUrlMap = new Map();
  try {
    // Do not process if in TEST mode
    if (process.env.APP_ENV === "test") {
      logMessage.info(
        `TEST MODE - Not submitting Form ID: ${reqFields ? reqFields.formID : "No form attached"}`
      );
      return "test-mode";
    }

    if (!reqFields) {
      throw new MissingFormDataError("No form submitted with request");
    }

    const form = await getPublicTemplateByID(reqFields.formID as string);

    if (!form) {
      throw new FormNotFoundError("No form could be found with that ID");
    }

    // Check to see if form is closed and block response submission
    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      throw new FormIsClosedError("Form is closed and not accepting submissions");
    }

    const fields = transformFormResponses({
      form,
      responses: reqFields,
    });

    await handleUpload(files, uploadedFilesKeyUrlMapping, fields);

    try {
      const submissionId = await invokeSubmissionLambda(
        form.id,
        fields,
        contentLanguage ? contentLanguage : "en",
        reqFields.securityAttribute ? (reqFields.securityAttribute as string) : "Protected A"
      );

      logMessage.info(`Response submitted for Form ID: ${form.id}`);

      return submissionId;
    } catch (error) {
      logMessage.info(`Attempted response submission for Form ID: ${form.id} failed`);
      throw error;
    }
  } catch (error) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        await deleteObject(key);
      });
    }

    throw error;
  }
};
