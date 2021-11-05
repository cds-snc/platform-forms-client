import { NotifyClient } from "notifications-node-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import formidable, { Fields, Files } from "formidable";
import convertMessage from "@lib/markdown";
import { getFormByID, rehydrateFormResponses } from "@lib/integration/helpers";
import { getSubmissionByID } from "@lib/integration/helpers";
import { logMessage } from "@lib/logger";
import { PublicFormSchemaProperties, Responses } from "@lib/types";
import { checkOne } from "@lib/flags";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const submit = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NodeJS.Timeout> => {
  try {
    const incomingForm = new formidable.IncomingForm({ maxFileSize: 8000000 }); // Set to 8 MB and override default of 200 MB
    // we have to return a response for the NextJS handler. So we create a Promise which will be resolved
    // with the data from the IncomingForm parse callback
    const data = (await new Promise(function (resolve, reject) {
      incomingForm.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        }
        resolve({ fields, files });
      });
    })) as
      | {
          fields: Fields;
          files: Files;
        }
      | string;

    if (typeof data === "string") {
      throw new Error(data);
    }
    return await processFormData(data.fields as Fields, data.files as Files, res, req);
  } catch (err) {
    logMessage.error(err as Error);
    return res.status(500).json({ received: false });
  }
};

const callLambda = async (formID: string, fields: Responses, language: string) => {
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
      })
    ),
  });

  try {
    const response = await lambdaClient.send(command);
    const decoder = new TextDecoder();
    const payload = decoder.decode(response.Payload);
    if (response.FunctionError || !JSON.parse(payload).status) {
      throw new Error("Submission API could not process form response");
    } else {
      logMessage.info("Submission Lambda Client successfully triggered");
    }
  } catch (err) {
    logMessage.error(err);
    throw new Error("Could not process request with Lambda Submission function");
  }
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

    const form = await getFormByID(reqFields.formID as string);

    if (!form) {
      return res.status(400).json({ error: "No form could be found with that ID" });
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    if (submitToReliabilityQueue === false) {
      // Set this to a 200 response as it's valid if the send to reliability queue option is off.
      return res.status(200).json({ received: true });
    }

    // Local development and Heroku
    if (notifyPreview) {
      return await previewNotify(form, fields).then((response) => {
        return res.status(201).json({ received: true, htmlEmail: response });
      });
    }

    // Staging or Production AWS environments
    for (const [_key, value] of Object.entries(files)) {
      const fileOrArray = value;
      if (!Array.isArray(fileOrArray)) {
        if (fileOrArray.name) {
          logMessage.info(`uploading: ${_key} - filename ${fileOrArray.name} `);
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
      } else if (Array.isArray(fileOrArray)) {
        // An array will be returned in a field that includes multiple files
        fileOrArray.forEach(async (fileItem, index) => {
          if (fileItem.name) {
            logMessage.info(`uploading: ${_key} - filename ${fileItem.name} `);
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
        });
      }
    }
    try {
      await callLambda(
        form.formID,
        fields,
        // pass in the language from the header content language... assume english as the default
        req.headers?.["content-language"] ? req.headers["content-language"] : "en"
      );

      if (notifyPreview) {
        const notifyPreviewResponse = await previewNotify(form, fields);
        return res.status(201).json({ received: true, htmlEmail: notifyPreviewResponse });
      } else {
        return res.status(201).json({ received: true });
      }
    } catch (err) {
      logMessage.error(err as Error);
      return res.status(500).json({ received: false });
    }
  } catch (err) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        logMessage.info(`deletion of key : ${key}  -  value: ${value}`);
        await deleteObject(key);
      });
    }
    logMessage.error(err as Error);

    return res.status(500).json({ received: false });
  }
};

export default submit;
