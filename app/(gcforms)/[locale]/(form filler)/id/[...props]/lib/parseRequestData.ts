import { FileInputResponse, SubmissionRequestBody } from "@lib/types";
import { ProcessedFile, SubmissionParsedRequest } from "@lib/types/submission-types";
import { FileObjectInvalid, FileSizeError, FileTypeError } from "./exceptions";
import {
  FileValidationResult,
  validateFileToUpload,
} from "@lib/validation/fileValidationServerSide";

/**
 * This function takes raw request JSON and parses the fields and files.
 * Base64 from the JSON will be transformed into File objects in which the underlying
 * file will be located in a temporary folder which is created using the tmp package.
 * @param requestBody {SubmissionRequestBody} - the raw request data to process
 */
export const parseRequestData = async (
  requestBody: SubmissionRequestBody
): Promise<SubmissionParsedRequest> => {
  return Object.keys(requestBody).reduce(
    async (prev, current) => {
      const previousValueResolved = await prev;
      const keyPairValue = requestBody[current];
      // in the case that the value is a string value this is a field
      if (typeof keyPairValue === "string" || typeof keyPairValue === "number") {
        return {
          ...previousValueResolved,
          fields: {
            ...previousValueResolved.fields,
            [current]: keyPairValue,
          },
        };
      }
      // in the case of an array we need to determine if this is a file array or a string array
      // which determines if the keypair is a file or a field
      else if (Array.isArray(keyPairValue)) {
        // copy array to avoid mutating raw request data
        const arrayValue = [...keyPairValue];
        // if its an empty array or the first value is a string type we just assume that it's a field
        if (arrayValue.length === 0 || typeof arrayValue[0] === "string") {
          return {
            ...previousValueResolved,
            fields: {
              ...previousValueResolved.fields,
              [current]: arrayValue as string[],
            },
          };
        }
        // otherwise we assume its a file
        else if (typeof arrayValue[0] === "object") {
          return {
            ...previousValueResolved,
            files: {
              ...previousValueResolved.files,
              [current]: await Promise.all(
                arrayValue.map(async (fileObj) => {
                  return processFileInputResponse(fileObj as FileInputResponse);
                })
              ),
            },
          };
        }
      } else if (typeof keyPairValue === "object") {
        return {
          ...previousValueResolved,
          files: {
            ...previousValueResolved.files,
            [current]: await processFileInputResponse(keyPairValue as FileInputResponse),
          },
        };
      }
      return previousValueResolved;
    },
    Promise.resolve({
      fields: {},
      files: {},
    } as SubmissionParsedRequest)
  );
};

/**
 * This function will take a FileInputResponse object and return a ProcessedFile should
 * the file conform to expected mimetypes and size. Otherwise an error will be thrown
 * @param fileInputResponse
 */
const processFileInputResponse = async (
  fileInputResponse: FileInputResponse
): Promise<ProcessedFile> => {
  if (
    fileInputResponse.name === null ||
    fileInputResponse.size === null ||
    fileInputResponse.based64EncodedFile === null
  ) {
    throw new FileObjectInvalid("FileInputResponse is missing required properties");
  }

  const fileAsBuffer = Buffer.from(fileInputResponse.based64EncodedFile, "base64");

  const fileValidationResult = await validateFileToUpload(
    fileInputResponse.name,
    fileInputResponse.size,
    fileAsBuffer
  );

  switch (fileValidationResult.result) {
    case FileValidationResult.SIZE_IS_TOO_LARGE:
      throw new FileSizeError(
        `FileValidationResult: file is too large to be processed. Detected size: ${fileValidationResult.detectedValue} bytes.`
      );
    case FileValidationResult.INVALID_EXTENSION:
      throw new FileTypeError(
        `FileValidationResult: file extension is not allowed. Detected extension: ${fileValidationResult.detectedValue}.`
      );
    case FileValidationResult.INVALID_MIME_TYPE:
      throw new FileTypeError(
        `FileValidationResult: file MIME type is not allowed. Detected MIME type: ${fileValidationResult.detectedValue}.`
      );
    case FileValidationResult.VALID:
      return {
        name: fileInputResponse.name,
        buffer: fileAsBuffer,
      };
  }
};
