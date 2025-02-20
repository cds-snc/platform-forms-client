import { sendEmail } from "./integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getOrigin } from "./origin";
import { DeactivationReason, DeactivationReasons } from "./types";

const defaultTemplate = (email: string, HOST: string) => {
  return `
(la version française suit)

Hello,

The GC Forms account for ${email} has been deactivated.

To find out more or request account reactivation, [contact us](${HOST}/en/contact).

Thanks,
The GC Forms team

Bonjour,

Le compte Formulaires GC de ${email} a été désactivé.

Pour en savoir plus ou pour demander la réactivation de votre compte, n’hésitez pas à [nous contacter](${HOST}/fr/contact).

Merci,
L’équipe Formulaires GC
`;
};

const sharedTemplate = (email: string, HOST: string) => {
  return `
(la version française suit)

Hello,

The GC Forms account for ${email} has been deactivated.

You can create a new account in GC Forms using an individual email address, not a shared inbox.

If you have any questions, [contact us](${HOST}/en/contact).

Thanks,
The GC Forms team

Bonjour,

Le compte Formulaires GC de ${email} a été désactivé.

Vous pouvez créer un nouveau compte dans Formulaires GC en utilisant une adresse courriel individuelle, et non une boîte de réception partagée.

Si vous avez des questions, n'hésitez pas à [nous contacter](${HOST}/fr/contact).

Merci,
L’équipe Formulaires GC
`;
};

export const sendDeactivationEmail = async (
  email: string,
  reason: DeactivationReason = DeactivationReasons.DEFAULT
) => {
  try {
    const HOST = await getOrigin();

    await sendEmail(email, {
      subject: "Account deactivated | Compte désactivé",
      formResponse:
        reason === DeactivationReasons.DEFAULT
          ? defaultTemplate(email, HOST)
          : sharedTemplate(email, HOST),
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to send deactivation notice to ${email}", "error":${
        (err as Error).message
      }}`
    );
    throw err;
  }
};
