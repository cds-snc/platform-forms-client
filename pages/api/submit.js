import { NotifyClient } from "notifications-node-client";
import getConfig from "next/config";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";
import { logger, logMessage } from "../../lib/logger";

const submit = async (req, res) => {
  try {
    const { publicRuntimeConfig } = getConfig();
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

    if (publicRuntimeConfig.isProduction) {
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
          console.log(response);
          if (response.FunctionError || !response.Payload.status) {
            throw Error("Submission API could not process form response");
          } else {
            return res.status(201).json({ received: true });
          }
        })
        .catch((err) => {
          logMessage.error(err);
          return res.status(500).json({ received: false });
        });
    } else if (process.env.NODE_ENV === "development") {
      // Will only run if using development env locally
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
    } else {
      // Note that Staging will not send email here.  We can figure that out once we have
      // Staging mirroring production
      logMessage.info("Not Sending Email - Test mode");
      return res.status(200).json({ received: true });
    }
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

export default logger(submit);
