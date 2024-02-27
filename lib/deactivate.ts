import { getNotifyInstance } from "./integration/notifyConnector";
import { logMessage } from "@lib/logger";

export const sendDeactivationEmail = async (email: string) => {
  try {
    const HOST = process.env.HOST_URL;
    const TEMPLATE_ID = process.env.TEMPLATE_ID;
    const notify = getNotifyInstance();

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
