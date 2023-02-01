import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";

const shareFormJSON = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const { emails, form } = req.body;

    const buffer = new Buffer(form);
    const base64data = buffer.toString("base64");

    if (!emails) {
      return res.status(404).json({ error: "Malformed request" });
    }

    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = new NotifyClient(
      "https://api.notification.canada.ca",
      process.env.NOTIFY_API_KEY
    );

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    emails.forEach(async (email: string) => {
      notifyClient.sendEmail(templateID, email, {
        personalisation: {
          application_file: {
            file: base64data,
            filename: "form.json",
            sending_method: "attach",
          },
          subject: "Form shared / Formulaire partagé",
          formResponse: `
**${session.user.name} (${session.user.email}) has shared a form with you.**

To preview this form:
- **Step 1**:
  Save the attached JSON form file to your computer.
- **Step 2**:
  Go to [GC Forms](${req.headers.host}). No account needed.
- **Step 3**:
  Select open a form file.
      `,
        },
        reference: null,
      });
    });

    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Failed to send request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], shareFormJSON);
