import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import { handledSendEmail } from "@lib/helpers";

// TODO: consider moving to .env var
const EMAIL_ADDRESS = "peter.thiessen@cds-snc.ca"; //"jose.jimenez@cds-snc.ca";

// Allows an authenticated or unauthenticated user to send an email requesting to be contacted
const requestSupport = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, request, description } = req.body;

  if (!name || !email || !request || !description) {
    return res.status(404).json({ error: "Malformed request" });
  }

  return await handledSendEmail({
    res,
    toEmail: EMAIL_ADDRESS,
    subject: "Contact request / Demande de soutien",
    body: `
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
  });
};

export default middleware([cors({ allowedMethods: ["POST"] })], requestSupport);
