/**
 * Send an invitation to register for GC Forms
 *
 * @param senderName Sender's name
 * @param message Message
 * @param registerUrlEn Registration URL
 * @param registerUrlFr Registration URL
 * @returns
 */
export const inviteToForms = (
  senderName: string,
  message: string,
  registerUrlEn: string,
  registerUrlFr: string
): string => `
(la version française suit)

${senderName} has invited you to create a GC Forms account.

${message}

[Create account](${registerUrlEn})

===

${senderName} has invited you to create a GC Forms account.

${message}

[Create account](${registerUrlFr})
`;
