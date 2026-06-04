// Public templates module API. Keep exports here intentional; prefer internal/* for implementation-only helpers.
export { createTemplate } from "./createTemplate";
export { getAllTemplates } from "./getAllTemplates";
export { getAllTemplatesForUser } from "./getAllTemplatesForUser";
export { getPublicTemplateByID } from "./getPublicTemplateByID";
export { getTemplatePublishedStatus } from "./getTemplatePublishedStatus";
export { getFullTemplateByID } from "./getFullTemplateByID";
export { getTemplateWithAssignedUsers } from "./getTemplateWithAssignedUsers";
export { updateTemplate } from "./updateTemplate";
export { updateIsPublishedForTemplate } from "./updateIsPublishedForTemplate";
export { removeAssignedUserFromTemplate } from "./removeAssignedUserFromTemplate";
export { addAssignedUserToTemplate } from "./addAssignedUserToTemplate";
export { syncAssignedUsersForTemplate } from "./syncAssignedUsersForTemplate";
export { updateFormPurpose } from "./updateFormPurpose";
export { updateFormSaveAndResume } from "./updateFormSaveAndResume";
export { removeDeliveryOption } from "./removeDeliveryOption";
export { cloneTemplate } from "./cloneTemplate";
export { deleteTemplate } from "./deleteTemplate";
export { restoreTemplate } from "./restoreTemplate";
export { assertCanEditTemplate } from "./assertCanEditTemplate";
export { mapTemplateToPublicFormRecord } from "./toPublicFormRecord";
export { updateClosedData } from "./updateClosedData";
export { updateSecurityAttribute } from "./updateSecurityAttribute";
export { getTemplateClosureState } from "./getTemplateClosureState";
export { getFormJSONConfig } from "./getFormJSONConfig";
export { updateFormBranding } from "./updateFormBranding";
export { notifyOwnersOwnerAdded, notifyOwnersOwnerRemoved } from "./internal/notifications";

export {
  TemplateAlreadyPublishedError,
  TemplateHasUnprocessedSubmissions,
} from "./internal/errors";

export type { TemplateOptions } from "./getAllTemplatesForUser";
