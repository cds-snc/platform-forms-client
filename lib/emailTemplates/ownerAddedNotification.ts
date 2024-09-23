/**
 * Send an invitation to register for GC Forms
 *
 * @param senderName
 * @param message
 * @param registerUrlEn
 * @param registerUrlFr
 * @returns
 */
export const ownerAddedNotification = (
  formTitleEn: string,
  formUrlEn: string,
  formTitleFr: string,
  formUrlFr: string,
  formOwner: string
): string => `
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
L’équipe Formulaires GC
`;
