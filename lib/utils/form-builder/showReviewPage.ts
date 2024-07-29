import { FormProperties } from "@lib/types";
import { formHasGroups } from "./formHasGroups";

export function showReviewPage(form: FormProperties) {
  if (!formHasGroups(form)) return false;
  return Array.isArray(form.groupsLayout) && form.groupsLayout.length > 1;
}
