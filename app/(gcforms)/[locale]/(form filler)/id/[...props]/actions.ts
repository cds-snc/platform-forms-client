"use server";
import { buildFormDataObject, rehydrateFormResponses } from "@lib/client/clientHelpers";
import {
  FileInputResponse,
  PublicFormRecord,
  Response,
  Responses,
  SubmissionRequestBody,
} from "@lib/types";
import { ProcessedFile, SubmissionParsedRequest } from "@lib/types/submission-types";
import { logMessage } from "@lib/logger";
import { getPublicTemplateByID } from "@lib/templates";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";
import { fileTypeFromBuffer } from "file-type";
import { acceptedFileMimeTypes } from "@lib/tsUtils";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export async function submitForm(
  values: Responses,
  language: string,
  formRecord: PublicFormRecord
) {
  // const { language, formRecord } = formikBag.props;
  // const { setStatus } = formikBag;

  const formDataObject = buildFormDataObject(formRecord, values);

  if (!formDataObject.formID) {
    throw new Error("No form ID submitted with request");
  }

  if (Object.entries(formDataObject).length <= 2) {
    throw new Error("No form data submitted with request");
  }

  const data = await parseRequestData(formDataObject as SubmissionRequestBody);

  return processFormData(data.fields, data.files);
}

/**
 * This function takes raw request JSON and parses the fields and files.
 * Base64 from the JSON will be transformed into File objects in which the underlying
 * file will be located in a temporary folder which is created using the tmp package.
 * @param requestBody {SubmissionRequestBody} - the raw request data to process
 */
const parseRequestData = async (
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
    throw new Error("FileSizeError: A file has been uploaded that is greater than 8mb in size");
  }
  // process Base64 encoded data
  if (typeof fileObj?.name === "string" && typeof fileObj?.file === "string") {
    // base64 string should be data URL https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
    const fileData = fileObj.file.match(/^data:([A-Za-z-+./]+);base64,(.+)$/);
    if (fileData?.length !== 3) {
      throw new Error(`FileTypeError: The file ${fileObj.name} was not a valid data URL`);
    }
    // create buffer with fileData
    const fileBuff = Buffer.from(fileData[2], "base64");
    // if the buffer is larger then 8mb then this is larger than the filesize that's allowed
    if (Buffer.byteLength(fileBuff) / 1048576 > 8) {
      throw new Error(
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
      throw new Error(
        `FileTypeError: The file ${fileObj.name} has been uploaded has an unacceptable mime type of ${mimeTypefilebuff}`
      );
    }
    return {
      name: fileObj.name,
      buffer: fileBuff,
    };
  }
  throw new Error(
    "FileObjectInvalid: A file object does not have the needed properties to process it"
  );
};

const processFormData = async (
  reqFields: Record<string, Response>,
  files: Record<string, ProcessedFile | ProcessedFile[]>
) => {
  const uploadedFilesKeyUrlMapping: Map<string, string> = new Map();
  try {
    // Do not process if in TEST mode
    if (process.env.APP_ENV === "test") {
      logMessage.info(
        `TEST MODE - Not submitting Form ID: ${reqFields ? reqFields.formID : "No form attached"}`
      );
      return; // return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!reqFields) {
      throw new Error("No form submitted with request");
      // return NextResponse.json({ error: "No form submitted with request" }, { status: 400 });
    }

    // @TODO
    // logMessage.info(
    //   `Path: ${req.nextUrl.pathname}, Method: ${req.method}, Form ID: ${
    //     reqFields ? reqFields.formID : "No form attached"
    //   }`
    // );

    const form = await getPublicTemplateByID(reqFields.formID as string);

    if (!form) {
      throw new Error("No form could be found with that ID");
      // return NextResponse.json({ error: "No form could be found with that ID" }, { status: 400 });
    }

    // Check to see if form is closed and block response submission
    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      throw new Error("Form is closed and not accepting submissions");
      // return NextResponse.json(
      //   { error: "Form is closed and not accepting submissions" },
      //   { status: 400 }
      // );
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
      // const contentLanguage = headers().get("content-language");
      const contentLanguage = "en"; // @TODO ??
      await callLambda(
        form.id,
        fields,
        // pass in the language from the header content language... assume english as the default
        contentLanguage ? contentLanguage : "en",
        reqFields.securityAttribute ? (reqFields.securityAttribute as string) : "Protected A"
      );
      return true;
    } catch (err) {
      logMessage.error(err as Error);
      throw err;
      // return NextResponse.json({ received: false }, { status: 500 });
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
    // return NextResponse.json({ received: false }, { status: 500 });
  }
};

const callLambda = async (
  formID: string,
  fields: Responses,
  language: string,
  securityAttribute: string
) => {
  const encoder = new TextEncoder();

  const command = new InvokeCommand({
    FunctionName: "Submission",
    Payload: encoder.encode(
      JSON.stringify({
        formID,
        language,
        responses: fields,
        securityAttribute,
      })
    ),
  });

  try {
    const response = await lambdaClient.send(command);
    const decoder = new TextDecoder();
    const payload = decoder.decode(response.Payload);
    if (response.FunctionError || !JSON.parse(payload).status) {
      throw new Error("Submission API could not process form response");
    }
  } catch (err) {
    logMessage.error(err as Error);
    throw new Error("Could not process request with Lambda Submission function");
  }
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
});
