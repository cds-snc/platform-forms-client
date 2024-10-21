/**
 * Send an invitation to collaborate on a form
 *
 * @param senderName Sender's name
 * @param message Message
 * @param formTitleEn Template name
 * @param formTitleFr Template name
 * @param formUrlEn Form URL
 * @param formUrlFr Form URL
 * @returns
 */
export const inviteToCollaborateEmailTemplate = (
  senderName: string,
  message: string,
  formTitleEn: string,
  formTitleFr: string,
  formUrlEn: string,
  formUrlFr: string
): string => `
(la version française suit)

You’ve been invited to access form responses in GC Forms by ${senderName}.

${message}

[Open ${formTitleEn || formTitleFr}](${formUrlEn})

===

Vous avez été invité à accéder aux réponses de formulaire dans Formulaires GC par ${senderName}.

${message}

[Ouvrir ${formTitleFr || formTitleEn}](${formUrlFr})
`;
