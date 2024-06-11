import { Response } from "@lib/types";
import { ProcessedFile } from "@lib/types/submission-types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";
import { rehydrateFormResponses } from "./rehydrateFormResponses";
import { callLambda } from "./callLambda";
import { FormIsClosedError, FormNotFoundError, MissingFormDataError } from "./exceptions";

export const processFormData = async (
  reqFields: Record<string, Response>,
  files: Record<string, ProcessedFile | ProcessedFile[]>,
  contentLanguage: string
) => {
  const uploadedFilesKeyUrlMapping: Map<string, string> = new Map();
  try {
    // Do not process if in TEST mode
    if (process.env.APP_ENV === "test") {
      logMessage.info(
        `TEST MODE - Not submitting Form ID: ${reqFields ? reqFields.formID : "No form attached"}`
      );
      return;
    }

    if (!reqFields) {
      throw new MissingFormDataError("No form submitted with request");
    }

    logMessage.info(`Form ID: ${reqFields ? reqFields.formID : "No form attached"}`);

    const form = await getPublicTemplateByID(reqFields.formID as string);

    if (!form) {
      throw new FormNotFoundError("No form could be found with that ID");
    }

    // Check to see if form is closed and block response submission
    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      throw new FormIsClosedError("Form is closed and not accepting submissions");
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    // Staging or Production AWS environments
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
              const currentValue = fields[splitKey[0]] as Record<string, unknown>[];
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
                currentValue[Number(splitKey[1])][`${splitKey[2]}-${index}`] = key;
              } else {
                fields[`${_key}-${index}`] = key;
              }
            }
          }
        }
      }
    }
    try {
      await callLambda(
        form.id,
        fields,
        contentLanguage ? contentLanguage : "en",
        reqFields.securityAttribute ? (reqFields.securityAttribute as string) : "Protected A"
      );
      return true;
    } catch (err) {
      logMessage.error(err as Error);
      throw err;
    }
  } catch (err) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        await deleteObject(key);
      });
    }
    logMessage.error(err as Error);
    throw err;
  }
};
