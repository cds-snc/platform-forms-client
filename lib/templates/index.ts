// Public templates module API. Keep exports here intentional; prefer internal/* for imp
export { notifyOwnerAdded, notifyOwnerRemoved } from "./internal/notifications";

export {
  TemplateAlreadyPublishedError,
  TemplateHasUnprocessedSubmissions,
} from "./internal/errors";

export type { TemplateOptions } from "./queries/getAllTemplatesForUser";
