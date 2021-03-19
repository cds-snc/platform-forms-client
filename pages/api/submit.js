import { NotifyClient } from "notifications-node-client";
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";
import { logger, logMessage } from "../../lib/logger";
import axios from "axios";

const submit = async (req, res) => {
  try {
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

    if (process.env.PRODUCTION_ENV) {
      const submissionFormat = await getSubmissionByID(req.body.form.id);
      const options = {
        url: process.env.SUBMISSION_API ?? null,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        data: {
          ...req.body,
          submissionFormat,
        },
      };
      await axios(options)
        .then((response) => {
          if (!response.data.status) {
            throw Error("Submission API could not process form response");
          }
        })
        .catch((err) => {
          throw err;
        });

      res.status(201).json({ received: true });
    } else if (process.env.NODE_ENV === "development") {
      // Will only run if using development env locally
      const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
      const notify = new NotifyClient(
        "https://api.notification.canada.ca",
        process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
      );

      const emailBody = await convertMessage(req.body);
      const messageSubject = req.body.form.titleEn + " Submission";
      await notify
        .previewTemplateById(templateID, {
          subject: messageSubject,
          formResponse: emailBody,
        })
        .then((response) => console.log(response.data.html))
        .catch((err) => {
          throw err;
        });
      res.status(201).json({ received: true });
    } else {
      // Note that Staging will not send email here.  We can figure that out once we have
      // Staging mirroring production
      logMessage.info("Not Sending Email - Test mode");
      res.status(200).json({ received: true });
    }
  } catch (err) {
    logMessage.error(err);
    res.status(500).json({ received: false });
  }
};

export default logger(submit);
