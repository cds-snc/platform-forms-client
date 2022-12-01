import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";

const SUPPORT_EMAIL_ADDRESS = "assistance+forms@cds-snc.freshdesk.com";

const requestPublishingPermission = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const { managerEmail, department, goals } = req.body;

    if (!managerEmail || !department || !goals) {
      return res.status(404).json({ error: "Malformed request" });
    }

    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = new NotifyClient(
      "https://api.notification.canada.ca",
      process.env.NOTIFY_API_KEY
    );

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await notifyClient.sendEmail(templateID, SUPPORT_EMAIL_ADDRESS, {
      personalisation: {
        subject: "Publishing permission request / Demande d'autorisation de publication",
        formResponse: `
${session.user.name} (${session.user.email}) from ${department} has requested permission to publish forms.

Goals:
${goals}

Manager email address: ${managerEmail} .
****
${session.user.name} (${session.user.email}) du ${department} a demandé l'autorisation de publier des formulaires.

Objectifs:
${goals}

Adresse email du responsable: ${managerEmail} .
`,
      },
      reference: null,
    });

    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Failed to send request" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), sessionExists()],
  requestPublishingPermission
);
