// Public templates module API. Keep exports here intentional; prefer internal/* for implementation-only helpers.
export { createTemplate } from "./createTemplate";
export { getAllTemplates } from "./getAllTemplates";
export { getAllTemplatesForUser } from "./getAllTemplatesForUser";
export { getPublicTemplateByID } from "./getPublicTemplateByID";
export { getTemplatePublishedStatus } from "./getTemplatePublishedStatus";
export { getFullTemplateByID } from "./getFullTemplateByID";
export { getTemplateWithAssociatedUsers } from "./getTemplateWithAssociatedUsers";
export { updateTemplate } from "./updateTemplate";
export { updateIsPublishedForTemplate } from "./updateIsPublishedForTemplate";
export { removeAssignedUserFromTemplate } from "./removeAssignedUserFromTemplate";
export { assignUserToTemplate } from "./assignUserToTemplate";
export { updateAssignedUsersForTemplate } from "./updateAssignedUsersForTemplate";
export { updateFormPurpose } from "./updateFormPurpose";
export { updateFormSaveAndResume } from "./updateFormSaveAndResume";
export { removeDeliveryOption } from "./removeDeliveryOption";
export { cloneTemplate } from "./cloneTemplate";
export { deleteTemplate } from "./deleteTemplate";
export { restoreTemplate } from "./restoreTemplate";
export { assertCanEditTemplate } from "./assertCanEditTemplate";
export { toPublicFormRecord } from "./toPublicFormRecord";
export { updateClosedData } from "./updateClosedData";
export { updateSecurityAttribute } from "./updateSecurityAttribute";
export { checkIfClosed } from "./checkIfClosed";
export { getFormJSONConfig } from "./getFormJSONConfig";
export { updateFormBranding } from "./updateFormBranding";
export { notifyOwnersOwnerAdded, notifyOwnersOwnerRemoved } from "./internal/notifications";

export {
  TemplateAlreadyPublishedError,
  TemplateHasUnprocessedSubmissions,
} from "./internal/errors";

export type { TemplateOptions } from "./getAllTemplatesForUser";
