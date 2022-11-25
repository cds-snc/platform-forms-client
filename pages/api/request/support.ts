import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { MiddlewareProps } from "@lib/types";

const SUPPORT_EMAIL_ADDRESS = "assistance+forms@cds-snc.freshdesk.com";

const requestSupport = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(403).json({});

    const { name, email, request, context } = req.body;

    if (!name || !email || !request || !context) {
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
        subject: "Support request / Demande de soutien",
        formResponse: `
${session.user.name} (${session.user.email}) has requested support for the form-builder.

Support request:
${request}

Additional details:
${context}

****
${session.user.name} (${session.user.email}) a demandé de soutien des form-builder.

Demande de soutien:
${request}

Détails supplémentaires:
${context}
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

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], requestSupport);
