import { NotifyClient } from "notifications-node-client";
import getConfig from "next/config";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";
import { logMessage } from "../../lib/logger";

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
      return res.status(400).json({ error: "No form submitted with request" });
    }

    // Staging or Production AWS environments
    if (process.env.SUBMISSION_API) {
      return await callLambda(req)
        .then(async () => {
          if (!isProduction && process.env.NOTIFY_API_KEY) {
            await previewNotify(req).then((response) => {
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
      return await previewNotify(req).then((response) => {
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

const callLambda = async (req) => {
  const submission = await getSubmissionByID(req.body.form.id);

  const labmdaClient = new LambdaClient({ region: "ca-central-1" });
  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? "",
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
        logMessage.info("Lambda Client successfully triggered");
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Submit function");
    });
};

const previewNotify = async (req) => {
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
      return response.data.html;
    })
    .catch((err) => {
      logMessage.error(err);
      return "<h1>Could not preview HTML / Error in processing </h2>";
    });
};

export default submit;
