// Public templates module API. Keep exports here intentional; prefer internal/* for implementation-only helpers.
export { createTemplate } from "./commands/createTemplate";
export { getAllTemplates } from "./queries/getAllTemplates";
export { getAllTemplatesForUser } from "./queries/getAllTemplatesForUser";
export { getPublicTemplateByID } from "./queries/getPublicTemplateByID";
export { getTemplatePublishedStatus } from "./queries/getTemplatePublishedStatus";
export { getFullTemplateByID } from "./queries/getFullTemplateByID";
export { getTemplateWithAssignedUsers } from "./queries/getTemplateWithAssignedUsers";
export { updateTemplate } from "./commands/updateTemplate";
export { updateIsPublishedForTemplate } from "./commands/updateIsPublishedForTemplate";
export { removeAssignedUserFromTemplate } from "./commands/removeAssignedUserFromTemplate";
export { addAssignedUserToTemplate } from "./commands/addAssignedUserToTemplate";
export { syncAssignedUsersForTemplate } from "./commands/syncAssignedUsersForTemplate";
export { updateFormPurpose } from "./commands/updateFormPurpose";
export { updateFormSaveAndResume } from "./commands/updateFormSaveAndResume";
export { removeDeliveryOption } from "./commands/removeDeliveryOption";
export { cloneTemplate } from "./commands/cloneTemplate";
export { deleteTemplate } from "./commands/deleteTemplate";
export { restoreTemplate } from "./commands/restoreTemplate";
export { assertCanEditTemplate } from "./guards/assertCanEditTemplate";
export { mapTemplateToPublicFormRecord } from "./mappers/mapTemplateToPublicFormRecord";
export { updateClosedData } from "./commands/updateClosedData";
export { updateSecurityAttribute } from "./commands/updateSecurityAttribute";
export { getTemplateClosureState } from "./queries/getTemplateClosureState";
export { getFormJSONConfig } from "./queries/getFormJSONConfig";
export { updateFormBranding } from "./commands/updateFormBranding";
export { notifyOwnersOwnerAdded, notifyOwnersOwnerRemoved } from "./internal/notifications";

export {
  TemplateAlreadyPublishedError,
  TemplateHasUnprocessedSubmissions,
} from "./internal/errors";

export type { TemplateOptions } from "./queries/getAllTemplatesForUser";
