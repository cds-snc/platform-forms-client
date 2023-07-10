import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";

export const transferOwnershipEmail = async ({
  emailTo,
  formTitleEn,
  formTitleFr,
  pastOwner,
  newOwner,
  formId,
}: {
  emailTo: string;
  formTitleEn: string;
  formTitleFr: string;
  pastOwner: string;
  newOwner: string;
  formId: string;
}) => {
  try {
    const HOST = process.env.NEXTAUTH_URL;
    const TEMPLATE_ID = process.env.TEMPLATE_ID;
    const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;
    const notify = new NotifyClient("https://api.notification.canada.ca", NOTIFY_API_KEY);

    const formUrlEn = `${HOST}/en/form-builder/responses/${formId}`;
    const formUrlFr = `${HOST}/fr/form-builder/responses/${formId}`;

    await notify.sendEmail(TEMPLATE_ID, emailTo, {
      personalisation: {
        subject: "Transferred form and responses | Formulaire et réponses transférés",
        formResponse: `
(la version française suit)

Hello,

The form, ${formTitleEn}, and its submitted responses, have been transferred:

From:  ${pastOwner}
To: ${newOwner}

Make sure to [download and confirm all responses](${formUrlEn}) within 14 days of submission.

Thanks,
The GC Forms team

Bonjour,

Le formulaire, ${formTitleFr}, et les réponses qu’il contient, a été transféré

De : ${pastOwner}
À :  ${newOwner}

Assurez-vous de [télécharger et confirmer toutes les réponses](${formUrlFr}) dans les 14 jours suivant leur soumission.

Merci,
L’équipe Formulaires GC`,
      },
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to transfer ownership email", "error":${
        (err as Error).message
      }}`
    );
    throw new Error("Notify failed to transfer ownership email");
  }
};

export const addOwnershipEmail = async ({
  emailTo,
  formTitleEn,
  formTitleFr,
  formOwner,
  formId,
}: {
  emailTo: string;
  formTitleEn: string;
  formTitleFr: string;
  formOwner: string;
  formId: string;
}) => {
  try {
    const HOST = process.env.NEXTAUTH_URL;
    const TEMPLATE_ID = process.env.TEMPLATE_ID;
    const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;
    const notify = new NotifyClient("https://api.notification.canada.ca", NOTIFY_API_KEY);

    const formUrlEn = `${HOST}/en/form-builder/responses/${formId}`;
    const formUrlFr = `${HOST}/fr/form-builder/responses/${formId}`;

    await notify.sendEmail(TEMPLATE_ID, emailTo, {
      personalisation: {
        subject: "Shared form access | Accès partagé au formulaire",
        formResponse: `
(la version française suit)

Hello,

The published form, ${formTitleEn}, and its submitted responses on [GC Forms](${formUrlEn}), are now accessible to:

${formOwner}


Thanks,
The GC Forms team

Bonjour,

Le formulaire publié, ${formTitleFr}, et les réponses qu’il contient dans [Formulaires GC](${formUrlFr}), est maintenant accessible à :

${formOwner}

Merci,
L’équipe Formulaires GC`,
      },
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to add ownership email", "error":${
        (err as Error).message
      }}`
    );
    throw new Error("Notify failed to add ownership email");
  }
};
