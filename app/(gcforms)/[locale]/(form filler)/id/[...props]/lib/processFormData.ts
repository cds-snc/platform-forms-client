import { Response } from "@lib/types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { deleteObject } from "@lib/s3-upload";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import { FormIsClosedError, FormNotFoundError, MissingFormDataError } from "./exceptions";
import { validatePayloadSize } from "@lib/validation/validatePayloadSize";

export const processFormData = async (
  responses: Record<string, Response>,
  fileKeys: string[],
  contentLanguage: string
): Promise<string> => {
  try {
    // Do not process if in TEST mode
    if (process.env.APP_ENV === "test") {
      logMessage.info(
        `TEST MODE - Not submitting Form ID: ${responses ? responses.formID : "No form attached"}`
      );
      return "test-mode";
    }

    if (!responses) {
      throw new MissingFormDataError("No form submitted with request");
    }

    const form = await getPublicTemplateByID(responses.formID as string);

    if (!form) {
      throw new FormNotFoundError("No form could be found with that ID");
    }

    // Check to see if form is closed and block response submission
    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      throw new FormIsClosedError("Form is closed and not accepting submissions");
    }

    const checkPayloadSize = validatePayloadSize(responses);

    if (!checkPayloadSize) {
      logMessage.info(`Payload size is too large for Form ID: ${form.id}.`);
      throw new Error("Payload size is too large");
    }

    try {
      const submissionId = await invokeSubmissionLambda(
        form.id,
        responses,
        contentLanguage ? contentLanguage : "en",
        responses.securityAttribute ? (responses.securityAttribute as string) : "Protected A",
        fileKeys.length > 0
      );

      logMessage.info(`Response submitted for Form ID: ${form.id}`);

      return submissionId;
    } catch (error) {
      logMessage.info(`Attempted response submission for Form ID: ${form.id} failed`);
      throw error;
    }
  } catch (error) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (fileKeys.length > 0) {
      const deletePromises = fileKeys.map((key) => deleteObject(key));
      await Promise.all(deletePromises);
    }

    throw error;
  }
};
