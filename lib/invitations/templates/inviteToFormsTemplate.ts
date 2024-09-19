/**
 * Send an invitation to register for GC Forms
 *
 * @param senderName
 * @param message
 * @param registerUrlEn
 * @param registerUrlFr
 * @returns
 */
export const inviteToFormsTemplate = (
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

French version

[Create account](${registerUrlFr})
`;
