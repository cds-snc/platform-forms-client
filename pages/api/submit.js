import { NotifyClient } from "notifications-node-client";
import { v4 as uuidv4 } from "uuid";
import convertMessage from "../../lib/markdown";
import { getSubmissionByID } from "../../lib/dataLayer";

export default (req, res) => {
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const uniqueReference = uuidv4();
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY
  );

  const emailBody = convertMessage(req.body);
  const messageSubject = req.body.form.titleEn + " Submission";
  const submissionFormat = getSubmissionByID(req.body.form.id);
  if ((submissionFormat !== null) & (submissionFormat.email !== "")) {
    notify
      .sendEmail(templateID, submissionFormat.email, {
        personalisation: {
          subject: messageSubject,
          formResponse: emailBody,
        },
        reference: uniqueReference,
      })
      .catch((err) => console.log(err));

    res.statusCode = 200;
    res.json({ subject: messageSubject, markdown: emailBody });
  }
};
