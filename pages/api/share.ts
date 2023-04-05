import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";

const shareFormJSON = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const { emails, form, filename }: { emails?: string[]; form?: string; filename?: string } =
      req.body;
    if (!emails || !form || !filename) {
      return res.status(400).json({ error: "Malformed request" });
    }

    const base64data = Buffer.from(form).toString("base64");

    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = new NotifyClient(
      "https://api.notification.canada.ca",
      process.env.NOTIFY_API_KEY
    );

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await Promise.all(
      emails.map((email: string) => {
        return notifyClient.sendEmail(templateID, email, {
          personalisation: {
            application_file: {
              file: base64data,
              filename: `${filename}.json`,
              sending_method: "attach",
            },
            subject: "Form shared | Formulaire partagé",
            formResponse: `
**${session.user.name} (${session.user.email}) has shared a form with you.**

To preview this form:
- **Step 1**:
  Save the attached JSON form file to your computer.
- **Step 2**:
  Go to [GC Forms](https://${req.headers.host}). No account needed.
- **Step 3**:
  Select open a form file.

****

**${session.user.name} (${session.user.email}) a partagé un formulaire avec vous.**

Pour prévisualiser ce formulaire :
- **Étape 1 :**
  Enregistrer le fichier de formulaire JSON ci-joint sur votre ordinateur.
- **Étape 2 :**
  Aller sur [Formulaires GC](https://${req.headers.host}). Aucun compte n'est nécessaire.
- Étape 3 :**
  Sélectionner "Ouvrir un formulaire".`,
          },
          reference: null,
        });
      })
    );

    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Failed to send request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], shareFormJSON);
