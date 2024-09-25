/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitle
 * @param formOwner
 * @returns
 */
export const ownerAddedNotification = (formTitle: string, formOwner: string): string => `
(la version française suit)

${formOwner} been added to the form ${formTitle}:

Thanks,
The GC Forms team

======

${formOwner} been added to the form ${formTitle}:

Thanks,
The GC Forms team
`;
