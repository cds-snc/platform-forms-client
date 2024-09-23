/**
 * Notify owners that an owner has been added to a form.
 *
 * @param formTitle
 * @param formOwner
 * @returns
 */
export const ownerRemovedNotification = (formTitle: string, formOwner: string): string => `
(la version française suit)

Hello ${formOwner},

You have been removed from the form ${formTitle}:

Thanks,
The GC Forms team

======

french version

`;
