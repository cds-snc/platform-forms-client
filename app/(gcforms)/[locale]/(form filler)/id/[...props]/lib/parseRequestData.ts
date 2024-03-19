import { FileInputResponse, SubmissionRequestBody } from "@lib/types";
import { fileTypeFromBuffer } from "file-type";
import { acceptedFileMimeTypes } from "@lib/tsUtils";
import { ProcessedFile, SubmissionParsedRequest } from "@lib/types/submission-types";
import { FileObjectInvalid, FileSizeError, FileTypeError } from "./exceptions";

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
                  return processFileData(fileObj as FileInputResponse);
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
            [current]: await processFileData(keyPairValue as FileInputResponse),
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
 * This function will take a FileInputResponse object and return File object should
 * the file conform to expected mimetypes and size. Otherwise an error will be thrown
 * @param fileObj
 */
const processFileData = async (fileObj: FileInputResponse): Promise<ProcessedFile> => {
  // Removing mmmagic due to build issue. Will be replaced with a better solution
  // TODO: Find better solution at determining file type
  // const { Magic, MAGIC_MIME_TYPE } = await import("mmmagic");

  // if we have a size key present in the data then we can simply throw an error if
  // that number is greater than 8mb. We do not depend on this however. This is simply
  // to be more efficient. Regardless if this parameter is less than 8mb the size will still be checked
  if (typeof fileObj?.size === "number" && fileObj.size / 1048576 > 8) {
    throw new FileSizeError(
      "FileSizeError: A file has been uploaded that is greater than 8mb in size"
    );
  }
  // process Base64 encoded data
  if (typeof fileObj?.name === "string" && typeof fileObj?.file === "string") {
    // base64 string should be data URL https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
    const fileData = fileObj.file.match(/^data:([A-Za-z-+./]+);base64,(.+)$/);
    if (fileData?.length !== 3) {
      throw new FileTypeError(`FileTypeError: The file ${fileObj.name} was not a valid data URL`);
    }
    // create buffer with fileData
    const fileBuff = Buffer.from(fileData[2], "base64");
    // if the buffer is larger then 8mb then this is larger than the filesize that's allowed
    if (Buffer.byteLength(fileBuff) / 1048576 > 8) {
      throw new FileSizeError(
        `FileSizeError: The file ${fileObj.name} has been uploaded that is greater than 8mb in size`
      );
    }
    // // determine the real mime type of the file from the buffer
    // const magic = new Magic(MAGIC_MIME_TYPE);
    // // promisify the magic.detect call so that it works cleanly with the async function
    // const detectFilePromise = (): Promise<string | string[]> => {
    //   return new Promise((resolve, reject) => {
    //     magic.detect(fileBuff, (err, result) => {
    //       if (err) {
    //         return reject(err);
    //       }
    //       return resolve(result);
    //     });
    //   });
    // };
    // use mmmagic lib to detect mime types for text files and file-type for binary files
    const mimeTypefilebuff = await fileTypeFromBuffer(fileBuff);
    if (!mimeTypefilebuff || !acceptedFileMimeTypes.includes(mimeTypefilebuff.mime)) {
      throw new FileTypeError(
        `FileTypeError: The file ${fileObj.name} has been uploaded has an unacceptable mime type of ${mimeTypefilebuff}`
      );
    }
    return {
      name: fileObj.name,
      buffer: fileBuff,
    };
  }
  throw new FileObjectInvalid(
    "FileObjectInvalid: A file object does not have the needed properties to process it"
  );
};
