/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitleEn Form title
 * @param formTitleFr Form title
 * @param formOwner Removed owner's name
 * @returns
 */
export const ownerRemovedEmailTemplate = (
  formTitleEn: string,
  formTitleFr: string,
  formOwner: string
): string => `
(la version française suit)

${formOwner} no longer has access to responses for the form: ${formTitleEn || formTitleFr}.

======

${formOwner} n’a plus accès aux réponses du formulaire ${formTitleFr || formTitleEn}.:
`;
