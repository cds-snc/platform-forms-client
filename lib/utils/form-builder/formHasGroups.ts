import { FormProperties } from "@lib/types";

export function formHasGroups(form: FormProperties) {
  if (!form || !form.groups) return false;
  return form.groups && Object.keys(form.groups).length > 0;
}

// TODO: formHasGroups() will include default groups like start, so all forms will be true.  -- add ticket
// - replace formHasGroups with formHasGroupsV2
// - replace showReviewPage() with formHasGroupsV2 (originally copied from showReviewPage.ts)
export function formHasGroupsV2(form: FormProperties) {
  if (!formHasGroups(form)) return false;
  return Array.isArray(form.groupsLayout) && form.groupsLayout.length > 0;
}
