import { NotifyClient } from "notifications-node-client";
import { v4 as uuidv4 } from "uuid";
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";
import { logger, logMessage } from "../../lib/logger";

const submit = (req, res) => {
  const formAttached = req.body.form ? true : false;
  logMessage.info(
    `Path: ${req.url}, Method: ${req.method}, Form ID: ${
      formAttached && req.body.form.id ? req.body.form.id : "No form attached"
    }`
  );
  if (!formAttached) {
    res.statusCode = 400;
    res.json({ error: "No form submitted with request" });
  }
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const uniqueReference = uuidv4();
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
  );

  const emailBody = convertMessage(req.body);
  const messageSubject = req.body.form.titleEn + " Submission";
  const submissionFormat = getSubmissionByID(req.body.form.id);
  const sendToNotify = process.env.NODE_ENV ?? "development";
  const testing = process.env.TEST ?? false;

  if (sendToNotify === "production" && !testing) {
    if ((submissionFormat !== null) & (submissionFormat.email !== "")) {
      notify
        .sendEmail(templateID, submissionFormat.email, {
          personalisation: {
            subject: messageSubject,
            formResponse: emailBody,
          },
          reference: uniqueReference,
        })
        .catch((err) => {
          logMessage.error(err);
          throw err;
        });

      res.statusCode = 202;
      res.json({ subject: messageSubject, markdown: emailBody });
    }
  } else if (sendToNotify === "development" && !testing) {
    notify
      .previewTemplateById(templateID, {
        subject: messageSubject,
        formResponse: emailBody,
      })
      .then((response) => console.log(response.data.html))
      .catch((err) => {
        logMessage.error(err);
        throw err;
      });
    res.statusCode = 201;
    res.json({ subject: messageSubject, markdown: emailBody });
  } else {
    logMessage.info("Not Sending Email - Test mode");
    res.statusCode = 200;
    res.json({ subject: messageSubject, markdown: emailBody });
  }
};

export default logger(submit);
