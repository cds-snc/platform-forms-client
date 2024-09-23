/**
 * Send an invitation to collaborate on a form
 *
 * @param senderName
 * @param message
 * @param templateName
 * @param formUrlEn
 * @param formUrlFr
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

${senderName} invited you to collaborate on a form.

${message}

[Open ${templateName}](${formUrlEn})

===

French version

[Open ${templateName}](${formUrlFr})
`;
