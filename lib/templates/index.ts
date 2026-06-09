// Public templates module API. Keep exports here intentional; prefer internal/* for imp
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
