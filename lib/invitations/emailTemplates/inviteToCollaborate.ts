/**
 * Send an invitation to collaborate on a form
 *
 * @param senderName Sender's name
 * @param message Message
 * @param templateName Form name
 * @param formUrlEn Form URL
 * @param formUrlFr Form URL
 * @returns
 */
export const inviteToCollaborate = (
  senderName: string,
  message: string,
  templateName: string,
  formUrlEn: string,
  formUrlFr: string
): string => `
(la version française suit)

${senderName} shared form ${templateName} with you.

${message}

[Open ${templateName}](${formUrlEn})

===

${senderName} shared form ${templateName} with you.

${message}

[Open ${templateName}](${formUrlFr})
`;
