import { NotifyClient } from "notifications-node-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import convertMessage from "@lib/markdown";
import { rehydrateFormResponses } from "@lib/integration/helpers";
import { getFormByID, getSubmissionByID } from "@lib/integration/crud";
import { logMessage } from "@lib/logger";
import { checkOne } from "@lib/flags";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";
import { fileTypeFromBuffer } from "file-type";
import { Magic, MAGIC_MIME_TYPE } from "mmmagic";
import { acceptedFileMimeTypes } from "@lib/tsUtils";
import { Readable } from "stream";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import {
  PublicFormRecord,
  Response,
  Responses,
  FileInputResponse,
  SubmissionRequestBody,
} from "@lib/types";
import { ProcessedFile, SubmissionParsedRequest } from "@lib/types/submission-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const protectedMethods = ["POST"];
const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
});

const submit = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    // we use the raw stream as opposed to enabling bodyParsing as NextJS enforces a 5mb limit on payload if bodyParsing is enabled
    // https://nextjs.org/docs/messages/api-routes-body-size-limit
    const stringBody = await streamToString(req);
    const incomingFormJSON = JSON.parse(stringBody) as SubmissionRequestBody;
    // We process the data into fields and files. Base64 file data is converted into buffers
    const data = await parseRequestData(incomingFormJSON);
    return await processFormData(data.fields, data.files, res, req);
  } catch (err) {
    logMessage.error(err as Error);
    return res.status(500).json({ received: false });
  }
};

/**
 * This function takes the request stream and parses the chunks into a concatenated string
 * @param stream {Readable} - The request stream from which to convert to a concatenated string
 */
function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const callLambda = async (
  formID: number,
  fields: Responses,
  language: string,
  securityAttribute: string
) => {
  const submission = await getSubmissionByID(formID);

  const encoder = new TextEncoder();

  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? "Submission",
    Payload: encoder.encode(
      JSON.stringify({
        formID,
        language,
        responses: fields,
        submission,
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

const previewNotify = async (form: PublicFormRecord, fields: Responses) => {
  const templateID = process.env.TEMPLATE_ID;
  const notify = new NotifyClient("https://api.notification.canada.ca", process.env.NOTIFY_API_KEY);

  const emailBody = await convertMessage({ form, responses: fields });
  const messageSubject = form.formConfig.form.emailSubjectEn
    ? form.formConfig.form.emailSubjectEn
    : form.formConfig.form.titleEn;
  return await notify
    .previewTemplateById(templateID, {
      subject: messageSubject,
      formResponse: emailBody,
    })
    .then((response: { data: { html: string } }) => {
      return response.data.html;
    })
    .catch((err: Error) => {
      logMessage.error(err);
      return "<h1>Could not preview HTML / Error in processing </h2>";
    });
};

/**
 * This function takes raw request JSON and parses the fields and files.
 * Base64 from the JSON will be transformed into File objects in which the underlying
 * file will be located in a temporary folder which is created using the tmp package.
 * @param requestBody {SubmissionRequestBody} - the raw request data to process
 */
const parseRequestData = async (
  requestBody: SubmissionRequestBody
): Promise<SubmissionParsedRequest> => {
  return await Object.keys(requestBody).reduce(
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
                  return await processFileData(fileObj as FileInputResponse);
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
    // determine the real mime type of the file from the buffer
    const magic = new Magic(MAGIC_MIME_TYPE);
    // promisify the magic.detect call so that it works cleanly with the async function
    const detectFilePromise = (): Promise<string | string[]> => {
      return new Promise((resolve, reject) => {
        magic.detect(fileBuff, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    };
    // use mmmagic lib to detect mime types for text files and file-type for binary files
    const [mimeTypefilebuff, mimeTypemmmagic] = await Promise.all([
      fileTypeFromBuffer(fileBuff),
      detectFilePromise(),
    ]);
    if (
      (!mimeTypefilebuff || !acceptedFileMimeTypes.includes(mimeTypefilebuff.mime)) &&
      (!mimeTypemmmagic || !acceptedFileMimeTypes.includes(mimeTypemmmagic as string))
    ) {
      throw new Error(
        `FileTypeError: The file ${
          fileObj.name
        } has been uploaded has an unacceptable mime type of ${
          mimeTypefilebuff ? mimeTypefilebuff.mime : mimeTypemmmagic
        }`
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
  files: Record<string, ProcessedFile | ProcessedFile[]>,
  res: NextApiResponse,
  req: NextApiRequest
) => {
  const uploadedFilesKeyUrlMapping: Map<string, string> = new Map();
  try {
    const submitToReliabilityQueue = await checkOne("submitToReliabilityQueue");
    const notifyPreview = await checkOne("notifyPreview");

    if (!reqFields) {
      return res.status(400).json({ error: "No form submitted with request" });
    }

    logMessage.info(
      `Path: ${req.url}, Method: ${req.method}, Form ID: ${
        reqFields ? reqFields.formID : "No form attached"
      }`
    );

    // Do not process if in TEST mode
    if (process.env.APP_ENV === "test") {
      logMessage.info(
        `TEST MODE - Not submitting Form ID: ${reqFields ? reqFields.formID : "No form attached"}`
      );
      return res.status(200).json({ received: true });
    }

    const form = await getFormByID(reqFields.formID as number);

    if (!form) {
      return res.status(400).json({ error: "No form could be found with that ID" });
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    if (!submitToReliabilityQueue) {
      // Local development and Heroku
      if (notifyPreview) {
        const response = await previewNotify(form, fields);
        return res.status(201).json({ received: true, htmlEmail: response });
      }
      // Set this to a 200 response as it's valid if the send to reliability queue option is off.
      return res.status(200).json({ received: true });
    }

    // Staging or Production AWS environments
    for (const [_key, value] of Object.entries(files)) {
      const fileOrArray = value;
      if (!Array.isArray(fileOrArray)) {
        if (fileOrArray.name) {
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
        form.formID,
        fields,
        // pass in the language from the header content language... assume english as the default
        req.headers?.["content-language"] ? req.headers["content-language"] : "en",
        reqFields.securityAttribute ? (reqFields.securityAttribute as string) : "Unclassified"
      );

      return res.status(201).json({ received: true });
    } catch (err) {
      logMessage.error(err as Error);
      return res.status(500).json({ received: false });
    }
  } catch (err) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        await deleteObject(key);
      });
    }
    logMessage.error(err as Error);

    return res.status(500).json({ received: false });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(protectedMethods)],
  submit
);
