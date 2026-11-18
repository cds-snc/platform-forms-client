import { type FormProperties } from "@lib/types";
import { resetReviewEndNextAction } from "@lib/groups/utils/resetReviewEndNextAction";
import { migrateTemplate } from "@lib/templates/schemaVersioning/migrateTemplate";
import { autoFlowFormIfPossible } from "./autoFlowFormIfPossible";
import { formHasGroups } from "./formHasGroups";

/** Prepare the same candidate for saving and live validation without modifying editor state. */
export const prepareTemplateForSave = (
  form: FormProperties,
  options: { logFailure?: boolean } = {}
): FormProperties => {
  const candidate = structuredClone(form);
  const normalized = autoFlowFormIfPossible({
    ...candidate,
    ...(formHasGroups(candidate) ? { groups: resetReviewEndNextAction(candidate.groups!) } : {}),
  });
  return migrateTemplate(normalized, options);
};
