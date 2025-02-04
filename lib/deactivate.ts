import { sendEmail } from "./integration/notifyConnector";
import { logMessage } from "@lib/logger";
// import { getOrigin } from "./origin";

/*
const defaultEmail = (email: string, HOST: string) => {
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
*/

const sharedAccountEmail = `
(la version française suit)
Hello,
As mentioned in an email on January 28, 2025, GC Forms is removing all accounts that use a shared email as they do not follow the GC Forms [terms of use](https://forms-formulaires.alpha.canada.ca/terms-of-use).
This includes access to your account for **((shared account email address))**, which has now been removed.
To continue using GC Forms, you can [create a new account](https://forms-formulaires.alpha.canada.ca/en/auth/register) using an email address that is associated with an individual employee, not a shared inbox.
If you have any questions, [contact us](https://forms-formulaires.alpha.canada.ca/en/form-builder/support).
Thanks,
The GC Forms team


Bonjour,
Tel que mentionné dans un courriel le 28 janvier 2025, Formulaires GC supprime tous les comptes qui utilisent un compte partagé puisqu'ils ne respectent pas les [conditions d'utilisation](https://forms-formulaires.alpha.canada.ca/fr/terms-of-use) de Formulaires GC.
Cela inclut l'accès à votre compte Formulaires GC pour ((shared account email address)) qui a maintenant été supprimé.
Pour continuer à utiliser Formulaires GC, vous pouvez [créer un nouveau compte](https://forms-formulaires.alpha.canada.ca/fr/auth/register) en utilisant une adresse courriel associée à un·e employé·e, et non une boîte de réception partagée.
Si vous avez des questions, n'hésitez pas à [nous contacter](https://forms-formulaires.alpha.canada.ca/fr/form-builder/support).
Merci,
L'équipe Formulaires GC
`;

export const sendDeactivationEmail = async (email: string) => {
  try {
    // const HOST = await getOrigin();

    await sendEmail(email, {
      subject: "Account deactivated | Compte désactivé",
      formResponse: sharedAccountEmail,
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
