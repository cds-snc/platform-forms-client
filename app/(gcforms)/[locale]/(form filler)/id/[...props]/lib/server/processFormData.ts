import { Response, SignedURLMap } from "@lib/types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import { FormIsClosedError, FormNotFoundError, MissingFormDataError } from "../client/exceptions";
import { validatePayloadSize } from "@lib/validation/validatePayloadSize";

export const processFormData = async (
  responses: Record<string, Response>,
  contentLanguage: string
): Promise<{
  submissionId: string;
  fileURLMap?: SignedURLMap;
}> => {
  // Do not process if in TEST mode
  if (process.env.APP_ENV === "test") {
    logMessage.info(
      `TEST MODE - Not submitting Form ID: ${responses ? responses.formID : "No form attached"}`
    );
    return { submissionId: "test-mode" };
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
    const { submissionId, fileURLMap } = await invokeSubmissionLambda(
      form.id,
      responses,
      contentLanguage ? contentLanguage : "en",
      responses.securityAttribute ? (responses.securityAttribute as string) : "Protected A"
    );

    logMessage.info(`Response submitted for Form ID: ${form.id}`);

    return { submissionId, fileURLMap };
  } catch (error) {
    logMessage.info(`Attempted response submission for Form ID: ${form.id} failed`);
    throw error;
  }
};
