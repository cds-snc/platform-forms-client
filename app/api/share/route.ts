import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { getNotifyInstance } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { slugify } from "@lib/clientHelpers";
import { headers } from "next/headers";
export const POST = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const reqHeaders = headers();
    const host = reqHeaders.get("host");

    const { emails, form, filename }: { emails?: string[]; form?: string; filename?: string } =
      props.body;
    if (!emails || !form || !filename) {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    const base64data = Buffer.from(form).toString("base64");

    const templateID = process.env.TEMPLATE_ID;
    const notifyClient = getNotifyInstance();

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await Promise.all(
      emails.map((email: string) => {
        return notifyClient.sendEmail(templateID, email, {
          personalisation: {
            application_file: {
              file: base64data,
              filename: `${slugify(filename)}.json`,
              sending_method: "attach",
            },
            subject: "Form shared | Formulaire partagé",
            formResponse: `
**${session.user.name} (${session.user.email}) has shared a form with you.**

To preview this form:
- **Step 1**:
  Save the attached JSON form file to your computer.
- **Step 2**:
  Go to [GC Forms](https://${host}). No account needed.
- **Step 3**:
  Select open a form file.

****

**${session.user.name} (${session.user.email}) a partagé un formulaire avec vous.**

Pour prévisualiser ce formulaire :
- **Étape 1 :**
  Enregistrer le fichier de formulaire JSON ci-joint sur votre ordinateur.
- **Étape 2 :**
  Aller sur [Formulaires GC](https://${host}). Aucun compte n'est nécessaire.
- **Étape 3 :**
  Sélectionner "Ouvrir un formulaire".`,
          },
          reference: null,
        });
      })
    );
    return NextResponse.json({});
  } catch (error) {
    logMessage.error(error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
});
