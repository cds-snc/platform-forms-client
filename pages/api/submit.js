import { NotifyClient } from "notifications-node-client";
import getConfig from "next/config";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import formidable from "formidable";
import fs from "fs";
import convertMessage from "../../lib/markdown";
import { getSubmissionByID, rehydrateFormResponses } from "../../lib/dataLayer";
import { logMessage } from "../../lib/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

const submit = async (req, res) => {
  try {
    const incomingForm = new formidable.IncomingForm();
    await incomingForm.parse(req, (err, fields, files) => {
      const form = { ...JSON.parse(fields.formInfo) };
      delete fields.formInfo;
      processFormData(form, fields, files, res, req).finally(() => {
        for (let [id] of Object.entries(files)) {
          console.log(`File path to be deleted: ${files[id].path}`);
          fs.unlinkSync(files[id].path);
        }
      });
    });
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

const callLambda = async (form, fields) => {
  const submission = await getSubmissionByID(form.id);

  const labmdaClient = new LambdaClient({ region: "ca-central-1" });

  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? "",
    Payload: JSON.stringify({
      form,
      responses: fields,
      submission,
    }),
  });
  return await labmdaClient
    .send(command)
    .then((response) => {
      let decoder = new TextDecoder();
      const payload = decoder.decode(response.Payload);
      if (response.FunctionError || !JSON.parse(payload).status) {
        throw Error("Submission API could not process form response");
      } else {
        logMessage.info("Lambda Client successfully triggered");
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Submit function");
    });
};

const previewNotify = async (form, fields) => {
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
  );

  const emailBody = await convertMessage({ form, responses: fields });
  const messageSubject = form.titleEn + " Submission";
  return await notify
    .previewTemplateById(templateID, {
      subject: messageSubject,
      formResponse: emailBody,
    })
    .then((response) => {
      return response.data.html;
    })
    .catch((err) => {
      logMessage.error(err);
      return "<h1>Could not preview HTML / Error in processing </h2>";
    });
};

const processFormData = async (form, reqFields, files, res, req) => {
  try {
    const {
      publicRuntimeConfig: { isProduction: isProduction },
    } = getConfig();

    const formAttached = form.id && reqFields ? true : false;

    logMessage.info(
      `Path: ${req.url}, Method: ${req.method}, Form ID: ${
        formAttached ? form.id : "No form attached"
      }`
    );
    if (!formAttached) {
      return res.status(400).json({ error: "No form submitted with request" });
    }

    // Add file S3 urls to payload once we start processing files through reliability queue
    // For now just attach the file names
    for (let [key, value] of Object.entries(files)) {
      reqFields[key] = value.name;
    }
    const fields = await rehydrateFormResponses({ form, responses: reqFields });

    // Staging or Production AWS environments
    if (process.env.SUBMISSION_API) {
      return await callLambda(form, fields)
        .then(async () => {
          if (!isProduction && process.env.NOTIFY_API_KEY) {
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
    else if (process.env.NOTIFY_API_KEY && process.env.NODE_ENV !== "test") {
      return await previewNotify(form, fields).then((response) => {
        return res.status(201).json({ received: true, htmlEmail: response });
      });
    } else {
      logMessage.info("Not Sending Email - Test mode");
      return res.status(200).json({ received: true });
    }
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

export default submit;
