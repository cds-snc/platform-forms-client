import { NotifyClient } from "notifications-node-client";
import getConfig from "next/config";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";
import { logger, logMessage } from "../../lib/logger";

// check if aws credentials (process.env.AWS_ACCESS_KEY_ID and process.env.AWS_SECRET_ACCESS_KEY)
// if prod and error throw and return issue (500)
// if notify API and not NODE_ENV==="test" key then preview and return render

const submit = async (req, res) => {
  try {
    const {
      publicRuntimeConfig: { isProduction: isProduction },
    } = getConfig();
    const formAttached = req.body.form ? true : false;
    logMessage.info(
      `Path: ${req.url}, Method: ${req.method}, Form ID: ${
        formAttached && req.body.form.id ? req.body.form.id : "No form attached"
      }`
    );
    if (!formAttached) {
      res.status(400).json({ error: "No form submitted with request" });
      return;
    }

    if (process.env.SUBMISSION_API) {
      try {
        if (isProduction) {
          return await callLambda(req, res, isProduction);
        } else {
          callLambda(req, res, isProduction);
        }
      } catch (err) {
        if (isProduction) {
          throw err;
        }
      }
    }
    if (process.env.NOTIFY_API_KEY && process.env.NODE_ENV !== "test") {
      return await previewNotify(req, res);
    }

    logMessage.info("Not Sending Email - Test mode");
    return res.status(200).json({ received: true });
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

const callLambda = async (req, res, isProduction) => {
  const submission = await getSubmissionByID(req.body.form.id);

  const labmdaClient = new LambdaClient({ region: "ca-central-1" });
  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? null,
    Payload: JSON.stringify({
      ...req.body,
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
        return res.status(201).json({ received: true });
      }
    })
    .catch((err) => {
      logMessage.error(err);
      if (isProduction) {
        return res.status(500).json({ received: false });
      }
    });
};

const previewNotify = async (req, res) => {
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
  );

  const emailBody = await convertMessage(req.body);
  const messageSubject = req.body.form.titleEn + " Submission";
  return await notify
    .previewTemplateById(templateID, {
      subject: messageSubject,
      formResponse: emailBody,
    })
    .then((response) => {
      return res.status(201).json({ received: true, htmlEmail: response.data.html });
    })
    .catch((err) => {
      logMessage.error(err);
      return res.status(500).json({ received: false });
    });
};

export default logger(submit);
