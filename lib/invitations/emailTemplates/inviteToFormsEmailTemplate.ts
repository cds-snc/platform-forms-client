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

${senderName} has invited you to collaborate in GC Forms. 

${message}

[Create an account](${registerUrlEn})

===

${senderName} vous a invité à collaborer dans Formulaires GC.

${message}

[Créer un compte](${registerUrlFr})
`;
