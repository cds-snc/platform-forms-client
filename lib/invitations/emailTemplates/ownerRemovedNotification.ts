/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitle Form title
 * @param formOwner Removed owner's name
 * @returns
 */
export const ownerRemovedNotification = (formTitle: string, formOwner: string): string => `
(la version française suit)

${formOwner} been removed from the form ${formTitle}:

Thanks,
The GC Forms team

======

${formOwner} been removed from the form ${formTitle}:

Thanks,
The GC Forms team

`;
