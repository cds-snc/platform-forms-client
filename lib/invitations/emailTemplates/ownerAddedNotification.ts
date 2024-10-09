/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitleEn
 * @param formTitleFr
 * @param formOwner
 * @returns
 */
export const ownerAddedNotification = (
  formTitleEn: string,
  formTitleFr: string,
  formOwner: string
): string => `
(la version française suit)

${formOwner} has been added to the form ${formTitleEn || formTitleFr}:

======

${formOwner} a été ajouté au formulaire ${formTitleFr || formTitleEn}:

`;
