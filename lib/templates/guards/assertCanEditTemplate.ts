import { authorization } from "@lib/privileges";

// Remove and replace this utility with new authorization object in code
export const assertCanEditTemplate = async (formID: string) => {
  await authorization.canEditForm(formID);
};
