/**
 * Notify a previous owner that they have been removed from a form.
 *
 * @param formTitleEn Form title
 * @param formTitleFr Form title
 * @returns
 */
export const youHaveBeenRemovedEmailTemplate = (
  formTitleEn: string,
  formTitleFr: string
): string => `
(la version française suit)

Your access was removed for the form: ${formTitleEn || formTitleFr}.

======

Vous n’avez plus accès au formulaire : ${formTitleFr || formTitleEn}

`;
