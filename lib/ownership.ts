import { sendEmail } from "./integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getOrigin } from "./origin";

export const transferOwnershipEmail = async ({
  emailTo = "",
  formTitleEn = "Untitled form",
  formTitleFr = "Formulaire sans titre",
  pastOwner = "",
  newOwner = "",
  formId = " ",
}: {
  emailTo: string;
  formTitleEn: string;
  formTitleFr: string;
  pastOwner: string;
  newOwner: string;
  formId: string;
}) => {
  try {
    const HOST = getOrigin();

    const formUrlEn = `${HOST}/en/form-builder/${formId}/responses`;
    const formUrlFr = `${HOST}/fr/form-builder/${formId}/responses`;

    await sendEmail(emailTo, {
      subject: "Transferred form and responses | Formulaire et réponses transférés",
      formResponse: `
(la version française suit)

Hello,

The form, ${formTitleEn}, and its submitted responses, have been transferred:

From:  ${pastOwner}
To: ${newOwner}

Make sure to [download and sign off on the removal of all responses](${formUrlEn}) within 14 days of submission.

Thanks,
The GC Forms team

Bonjour,

Le formulaire, ${formTitleFr}, et les réponses qu’il contient, a été transféré

De : ${pastOwner}
À :  ${newOwner}

Assurez-vous de [télécharger et approuver la suppression de toutes les réponses](${formUrlFr}) dans les 14 jours suivant leur soumission.

Merci,
L’équipe Formulaires GC`,
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to transfer ownership email", "error":${
        (err as Error).message
      }}`
    );
    throw err;
  }
};

export const addOwnershipEmail = async ({
  emailTo = "",
  formTitleEn = "Untitled form",
  formTitleFr = "Formulaire sans titre",
  formOwner = "",
  formId = "",
}: {
  emailTo: string;
  formTitleEn: string;
  formTitleFr: string;
  formOwner: string;
  formId: string;
}) => {
  try {
    const HOST = getOrigin();

    const formUrlEn = `${HOST}/en/form-builder/${formId}/responses`;
    const formUrlFr = `${HOST}/fr/form-builder/${formId}/responses`;

    await sendEmail(emailTo, {
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
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to add ownership email", "error":${
        (err as Error).message
      }}`
    );
    throw err;
  }
};
