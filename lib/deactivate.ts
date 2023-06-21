import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";

export const sendDeactivationEmail = async (email: string) => {
  try {
    const HOST = process.env.NEXTAUTH_URL;
    const TEMPLATE_ID = process.env.TEMPLATE_ID;
    const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;
    const notify = new NotifyClient("https://api.notification.canada.ca", NOTIFY_API_KEY);

    await notify.sendEmail(TEMPLATE_ID, email, {
      personalisation: {
        subject: "Account deactivated | Compte désactivé",
        formResponse: `
(la version française suit)

Hello,

The GC Forms account for ${email} has been deactivated.

To find out more or request account reactivation, [contact us](${HOST}/en/form-builder/support/contactus).

Thanks,
The GC Forms team

Bonjour,

Le compte Formulaires GC de ${email} a été désactivé.

Pour en savoir plus ou pour demander la réactivation de votre compte, n’hésitez pas à [nous contacter](${HOST}/fr/form-builder/support/contactus).

Merci,
L’équipe Formulaires GC
`,
      },
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to send deactivation notice", "error":${
        (err as Error).message
      }}`
    );
    throw new Error("Notify failed to send deactivation notice");
  }
};
