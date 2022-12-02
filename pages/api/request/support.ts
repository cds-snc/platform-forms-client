import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import { handledSendEmail } from "@lib/helpers";

// TODO: consider moving to .env var
const EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; //"assistance+forms@cds-snc.freshdesk.com";

// Allows an authenticated or unauthenticated user to send an email requesting support
const requestSupport = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, request, description } = req.body;

  if (!name || !email || !request || !description) {
    return res.status(404).json({ error: "Malformed request" });
  }

  return await handledSendEmail({
    res,
    toEmail: EMAIL_ADDRESS,
    subject: "Support request / Demande de soutien",
    body: `
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
`,
  });
};

export default middleware([cors({ allowedMethods: ["POST"] })], requestSupport);
