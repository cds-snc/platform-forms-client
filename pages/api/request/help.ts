import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { MiddlewareProps } from "@lib/types";

const SUPPORT_EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; // "assistance+forms@cds-snc.freshdesk.com";
const CONTACTUS_EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; // "jose.jimenez@cds-snc.ca";

const requestSupport = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(403).json({});

    const { type, name, email, request, description } = req.body;

    if (!name || !email || !request || !description) {
      return res.status(404).json({ error: "Malformed request" });
    }

    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = new NotifyClient(
      "https://api.notification.canada.ca",
      process.env.NOTIFY_API_KEY
    );

    const TO_EMAIL_ADDRESS = type === "support" ? SUPPORT_EMAIL_ADDRESS : CONTACTUS_EMAIL_ADDRESS;

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await notifyClient.sendEmail(templateID, TO_EMAIL_ADDRESS, {
      personalisation: {
        subject:
          type === "support"
            ? "Support request / Demande de soutien"
            : "Contact request / Demande de soutien",
        formResponse:
          type === "support"
            ? `
${name} (${email}) has requested support for the form-builder.

Support request:
${request}

Additional details:
${description}

****
${name} (${email}) a demandé de soutien des form-builder.

Demande de soutien:
${request}

Détails supplémentaires:
${description}
`
            : `
${name} (${email}) has requested we contact them for the form-builder.

Contact request:
${request}

Additional details:
${description}

****
${name} (${email}) a demandé que nous les contactions pour le générateur de formulaires..

Demande de contact soutien:
${request}

Détails supplémentaires:
${description}
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
