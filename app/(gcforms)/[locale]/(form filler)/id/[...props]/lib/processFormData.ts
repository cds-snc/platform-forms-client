import { Response } from "@lib/types";
import { ProcessedFile } from "@lib/types/submission-types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";
import { transformFormResponses } from "./transformFormResponses";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import { FormIsClosedError, FormNotFoundError, MissingFormDataError } from "./exceptions";
import { validatePayloadSize } from "@lib/validation/validatePayloadSize";

export const processFormData = async (
  reqFields: Record<string, Response>,
  files: Record<string, ProcessedFile | ProcessedFile[]>,
  contentLanguage: string
): Promise<string> => {
  const uploadedFilesKeyUrlMapping: Map<string, string> = new Map();
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

    for (const [_key, value] of Object.entries(files)) {
      const fileOrArray = value;
      if (!Array.isArray(fileOrArray)) {
        if (fileOrArray.name) {
          // eslint-disable-next-line no-await-in-loop
          const { isValid, key } = await pushFileToS3(fileOrArray);
          if (isValid) {
            uploadedFilesKeyUrlMapping.set(fileOrArray.name, key);
            const splitKey = _key.split("-");
            if (splitKey.length > 1) {
              if (!fields[splitKey[0]]) {
                fields[splitKey[0]] = [];
              }

              const currentValue = fields[splitKey[0]] as Record<string, unknown>[];
              if (!currentValue[Number(splitKey[1])]) {
                currentValue[Number(splitKey[1])] = {};
              }
              currentValue[Number(splitKey[1])][splitKey[2]] = key;
            } else {
              fields[_key] = key;
            }
          }
        }
      } else {
        // An array will be returned in a field that includes multiple files
        for (const fileItem of fileOrArray) {
          const index = fileOrArray.indexOf(fileItem);
          if (fileItem.name) {
            // eslint-disable-next-line no-await-in-loop
            const { isValid, key } = await pushFileToS3(fileItem);
            if (isValid) {
              uploadedFilesKeyUrlMapping.set(fileItem.name, key);
              const splitKey = _key.split("-");
              if (splitKey.length > 1) {
                const currentValue = fields[splitKey[0]] as Record<string, unknown>[];
                if (!currentValue[Number(splitKey[1])]) {
                  currentValue[Number(splitKey[1])] = {};
                }
                currentValue[Number(splitKey[1])][`${splitKey[2]}-${index}`] = key;
              } else {
                fields[`${_key}-${index}`] = key;
              }
            }
          }
        }
      }
    }

    const checkPayloadSize = validatePayloadSize(fields);

    if (!checkPayloadSize) {
      logMessage.info(`Payload size is too large for Form ID: ${form.id}.`);
      throw new Error("Payload size is too large");
    }

    try {
      const submissionId = await invokeSubmissionLambda(
        form.id,
        fields,
        contentLanguage ? contentLanguage : "en",
        reqFields.securityAttribute ? (reqFields.securityAttribute as string) : "Protected A",
        Object.keys(files).length > 0 ? true : false
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
