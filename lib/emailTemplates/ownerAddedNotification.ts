/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitle
 * @param formUrlEn
 * @param formUrlFr
 * @param formOwner
 * @returns
 */
export const ownerAddedNotification = (
  formTitle: string,
  formUrlEn: string,
  formUrlFr: string,
  formOwner: string
): string => `
(la version française suit)

Hello,

The published form, ${formTitle}, and its submitted responses on [GC Forms](${formUrlEn}), are now accessible to:

${formOwner}


Thanks,
The GC Forms team

Bonjour,

Le formulaire publié, ${formTitle}, et les réponses qu’il contient dans [Formulaires GC](${formUrlFr}), est maintenant accessible à :

${formOwner}

Merci,
L’équipe Formulaires GC
`;
