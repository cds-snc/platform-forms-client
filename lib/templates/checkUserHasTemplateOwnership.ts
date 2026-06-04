import { authorization } from "../privileges";

// Remove and replace this utility with new authorization object in code
export const checkUserHasTemplateOwnership = async (formID: string) => {
  await authorization.canEditForm(formID);
};
