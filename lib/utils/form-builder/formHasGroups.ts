import { FormProperties } from "@lib/types";

// Deprecated, no longer used - all forms have groups
export function formHasGroups(form: FormProperties) {
  if (!form || !form.groups) return false;
  return form.groups && Object.keys(form.groups).length > 0;
}
