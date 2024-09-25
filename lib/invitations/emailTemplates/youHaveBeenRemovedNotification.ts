/**
 * Notify a previous owner that they have been removed from a form.
 *
 * @param formTitle Form title
 * @param formOwner Remover's name
 * @returns
 */
export const youHaveBeenRemovedNotification = (formTitle: string, formOwner: string): string => `
(la version française suit)

${formOwner} has removed you from ${formTitle}:

Thanks,
The GC Forms team

======

${formOwner} has removed you from ${formTitle}:

Thanks,
The GC Forms team

`;
