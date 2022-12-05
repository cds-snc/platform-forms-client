import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import { sendEmail } from "@lib/helpers";
import { logMessage } from "@lib/logger";

// TODO: consider moving to .env var
const CONTACTUS_EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; //"jose.jimenez@cds-snc.ca";
const SUPPORT_EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; //"assistance+forms@cds-snc.freshdesk.com";

// Allows an authenticated or unauthenticated user to send an email requesting to be contacted
const requestSupport = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, name, email, request, description } = req.body;

  if (!name || !email || !request || !description) {
    return res.status(404).json({ error: "Malformed request" });
  }

  let emailBody = "";
  if (type === "contactus") {
    emailBody = `
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
    `;
  } else {
    emailBody = `
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
`;
  }

  try {
    await sendEmail({
      toEmail: type === "contactus" ? CONTACTUS_EMAIL_ADDRESS : SUPPORT_EMAIL_ADDRESS,
      subject:
        type === "contactus"
          ? "Contact request / Demande de soutien"
          : "Support request / Demande de soutien",
      body: emailBody,
    });
    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Failed to send request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] })], requestSupport);
