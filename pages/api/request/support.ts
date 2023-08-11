import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, csrfProtected } from "@lib/middleware";
import { getNotifyInstance } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";

// Allows an authenticated or unauthenticated user to send an email requesting help
const requestSupport = async (req: NextApiRequest, res: NextApiResponse) => {
  const { supportType, name, email, request, description, department, branch, jobTitle } = req.body;

  if (supportType === "contactus") {
    if (!name || !email || !request || !description || !department || !branch || !jobTitle) {
      return res.status(400).json({ error: "Malformed request" });
    }
  } else {
    if (!name || !email || !request || !description) {
      return res.status(400).json({ error: "Malformed request" });
    }
  }

  const to =
    supportType === "contactus"
      ? process.env.EMAIL_ADDRESS_CONTACT_US
      : process.env.EMAIL_ADDRESS_SUPPORT;

  const subject =
    supportType === "contactus"
      ? "Contact request / Demande de soutien"
      : "Support request / Demande de soutien";

  // Request may be a list of strings (checkbox), format it a bit if so, or just a string (radio)
  const requestParsed =
    request.toString().split(",").length > 1
      ? request
          .toString()
          .split(",")
          .map((item: string) => `-${item}`)
          .join("\n")
      : request;

  let emailBody = "";
  if (supportType === "contactus") {
    emailBody = `
${name} (${email}) has requested we contact them for the form-builder.

Department or agency:
${department}

Branch or sector: 
${branch}

Job Title:
${jobTitle}

Contact request:
${requestParsed}

Additional details:
${description}

****
${name} (${email}) a demandé que nous les contactions pour le générateur de formulaires..

Ministère ou organisme:
${department}

Direction ou secteur:
${branch}

Titre de poste:
${jobTitle}

Demande de contact soutien:
${requestParsed}

Détails supplémentaires:
${description}
    `;
  } else {
    emailBody = `
${name} (${email}) has requested support for the form-builder.

Support request:
${requestParsed}

Additional details:
${description}

****
${name} (${email}) a demandé de soutien des form-builder.

Demande de soutien:
${requestParsed}

Détails supplémentaires:
${description}
`;
  }

  try {
    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = getNotifyInstance();

    // Here is the documentation for the `sendEmail` function:
    // https://docs.notifications.service.gov.uk/node.html#send-an-email
    await notifyClient.sendEmail(templateID, to, {
      personalisation: {
        subject: subject,
        formResponse: emailBody,
      },
      reference: null,
    });

    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Internal Service Error: Failed to send request" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  requestSupport
);
