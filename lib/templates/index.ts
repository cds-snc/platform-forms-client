// Public templates module API. Keep exports here intentional; prefer internal/* for implementation-only helpers.
export { getTemplateWithAssignedUsers } from "./queries/getTemplateWithAssignedUsers";
export { updateTemplate } from "./mutations/updateTemplate";
export { updateIsPublishedForTemplate } from "./mutations/updateIsPublishedForTemplate";
export { removeAssignedUserFromTemplate } from "./mutations/removeAssignedUserFromTemplate";
export { addAssignedUserToTemplate } from "./mutations/addAssignedUserToTemplate";
export { syncAssignedUsersForTemplate } from "./mutations/syncAssignedUsersForTemplate";
export { updateFormPurpose } from "./mutations/updateFormPurpose";
export { updateFormSaveAndResume } from "./mutations/updateFormSaveAndResume";
export { removeDeliveryOption } from "./mutations/removeDeliveryOption";
export { cloneTemplate } from "./mutations/cloneTemplate";
export { deleteTemplate } from "./mutations/deleteTemplate";
export { restoreTemplate } from "./mutations/restoreTemplate";
export { mapTemplateToPublicFormRecord } from "./internal/index";
export { updateClosedData } from "./mutations/updateClosedData";
export { updateSecurityAttribute } from "./mutations/updateSecurityAttribute";
export { getTemplateClosureState } from "./queries/getTemplateClosureState";
export { getFormJSONConfig } from "./queries/getFormJSONConfig";
export { updateFormBranding } from "./mutations/updateFormBranding";
export { notifyOwnerAdded, notifyOwnerRemoved } from "./internal/notifications";

export {
  TemplateAlreadyPublishedError,
  TemplateHasUnprocessedSubmissions,
} from "./internal/errors";

export type { TemplateOptions } from "./queries/getAllTemplatesForUser";
