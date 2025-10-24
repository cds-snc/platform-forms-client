/**
 * Send an invitation to register for GC Forms
 *
 * @param senderName Sender's name
 * @param message Message
 * @param registerUrlEn Registration URL
 * @param registerUrlFr Registration URL
 * @returns
 */
export const inviteToFormsEmailTemplate = (
  senderName: string,
  message: string,
  registerUrlEn: string,
  registerUrlFr: string
): string => `
(la version française suit)

${senderName} has invited you to collaborate on a form in GC Forms. 

${message}

Once you [create an account](${registerUrlEn}), you can join your colleague's form and help them manage form responses. 

You may also choose to turn on notifications for new responses by navigating to Settings > Response options.

===

${senderName} vous a invité à collaborer à un formulaire dans Formulaires GC.

${message}

Une fois que vous [créez un compte](${registerUrlFr}) vous pouvez rejoindre le formulaire de votre collègue et l'aider à gérer les réponses au formulaire. 

Vous pouvez également choisir d'activer les notifications pour les nouvelles réponses en naviguant vers Paramètres > Options liées aux réponses.

`;
