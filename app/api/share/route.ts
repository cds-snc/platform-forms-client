import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { slugify } from "@lib/client/clientHelpers";
import { headers } from "next/headers";
import { isValidEmail } from "@lib/validation/isValidEmail";
import { getFullTemplateByID } from "@lib/templates";

export const POST = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const reqHeaders = await headers();
    const host = reqHeaders.get("host");

    const { emails, formId, filename }: { emails?: string[]; formId?: string; filename?: string } =
      props.body;

    if (!emails || emails.length < 1 || !formId || !filename) {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    const template = await getFullTemplateByID(formId);

    if (!template || !template.form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const base64data = Buffer.from(JSON.stringify(template.form)).toString("base64");

    // Ensure valid email addresses
    const cleanedEmails = emails.filter((email) => isValidEmail(email));

    if (cleanedEmails.length < 1) {
      return NextResponse.json({ error: "Invalid email addresses" }, { status: 400 });
    }

    let cleanedFilename = slugify(filename);

    // Shorten file name to 50 characters
    if (cleanedFilename.length > 50) {
      cleanedFilename = cleanedFilename.substring(0, 50);
    }

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await Promise.all(
      emails.map((email: string) => {
        return sendEmail(email, {
          application_file: {
            file: base64data,
            filename: `${cleanedFilename}.json`,
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
        });
      })
    );
    return NextResponse.json({});
  } catch (error) {
    logMessage.error(error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
});
