import { NotifyClient } from "notifications-node-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import formidable from "formidable";
import convertMessage from "@lib/markdown";
import { getFormByID, getSubmissionByID, rehydrateFormResponses } from "@lib/dataLayer";
import { logMessage } from "@lib/logger";
import { PublicFormSchemaProperties, Responses, UploadResult } from "@lib/types";
import { checkOne } from "@lib/flags";
import { uploadFileToS3, deleteObject } from "../../lib/s3-upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const submit = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const incomingForm = new formidable.IncomingForm({ maxFileSize: 8000000 }); // Set to 8 MB and override default of 200 MB
    return incomingForm.parse(req, async (err, fields, files) => {
      if (err) {
        throw new Error(err);
      }
      //TODO file extension validation before processing.
      return await processFormData(fields, files, res, req);
    });
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

const callLambda = async (formID: string, fields: Responses) => {
  const submission = await getSubmissionByID(formID);

  const encoder = new TextEncoder();

  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? "Submission",
    Payload: encoder.encode(
      JSON.stringify({
        formID,
        responses: fields,
        submission,
      })
    ),
  });
  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const payload = decoder.decode(response.Payload);
      if (response.FunctionError || !JSON.parse(payload).status) {
        throw Error("Submission API could not process form response");
      } else {
        logMessage.info("Submission Lambda Client successfully triggered");
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Submission function");
    });
};

const previewNotify = async (form: PublicFormSchemaProperties, fields: Responses) => {
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
  );

  const emailBody = await convertMessage({ form, responses: fields });
  const messageSubject = form.emailSubjectEn ? form.emailSubjectEn : form.titleEn;
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

const processFormData = async (
  reqFields: Responses | undefined,
  files: formidable.Files,
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

    if (process.env.CYPRESS) {
      logMessage.info("Not Sending to Backend Processing - Test mode");
      return await setTimeout(() => res.status(200).json({ received: true }), 1000);
    }

    for (const [_key, value] of Object.entries(files)) {
      const fileOrArray = value;
      if (!Array.isArray(fileOrArray)) {
        if (fileOrArray.name) {
          console.debug(`uploading: ${_key} - filename ${fileOrArray.name} `);
          const { isValid, result, key } = await pushFileToS3(fileOrArray, fileOrArray.name);
          if (isValid) uploadedFilesKeyUrlMapping.set(key as string, result);
        }
      } else if (Array.isArray(fileOrArray)) {
        fileOrArray.forEach(async (fileItem) => {
          if (fileItem.name) {
            console.debug(`uploading: ${_key} - filename ${fileItem.name} `);
            const { isValid, result, key } = await pushFileToS3(fileItem, fileItem.name);
            if (isValid) uploadedFilesKeyUrlMapping.set(key as string, result);
          }
        });
      }
    }

    const form = await getFormByID(reqFields.formID as string);

    if (!form) {
      return res.status(400).json({ error: "No form could be found with that ID" });
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    // Staging or Production AWS environments
    if (submitToReliabilityQueue) {
      return await callLambda(form.formID, fields)
        .then(async () => {
          if (notifyPreview) {
            await previewNotify(form, fields).then((response) => {
              return res.status(201).json({ received: true, htmlEmail: response });
            });
          } else {
            return res.status(201).json({ received: true });
          }
        })
        .catch((err) => {
          logMessage.error(err);
          return res.status(500).json({ received: false });
        });
    }
    // Local development and Heroku
    else if (notifyPreview) {
      return await previewNotify(form, fields).then((response) => {
        return res.status(201).json({ received: true, htmlEmail: response });
      });
    }
    // Set this to a 200 response as it's valid if the send to reliability queue option is off.
    return res.status(200).json({ received: true });
  } catch (err) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      const bucketName: string =
        (process.env.AWS_BUCKET_NAME as string) ?? "temp-s3-upload-testing";
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        console.debug(`deletion of key : ${key}  -  value: ${value}`);
        await deleteObject(bucketName, key);
      });
    }
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

/**
 * Push a given file to a temporary S3
 * @param fileOrArray
 * @param reqFields
 * @param key
 */
const pushFileToS3 = async (file: formidable.File, fileName: string): Promise<UploadResult> => {
  // Set bucket name default value to something actual value once known
  const bucketName: string = (process.env.AWS_BUCKET_NAME as string) ?? "temp-s3-upload-testing";
  const uploadResult: UploadResult = await uploadFileToS3(file, bucketName, fileName);
  const { isValid, result } = uploadResult;
  if (!isValid) {
    throw new Error(result);
  }
  return uploadResult;
};
export default submit;
