import { FormProperties } from "@lib/types/form-types";

export const initializeGroups = (form: FormProperties, allowGroups: boolean): FormProperties => {
  // Clean and remove any existing groups
  if (!allowGroups) {
    form.groups = {};
    return form;
  }

  // Check if the form groups is an empty object
  if (form.groups && Object.keys(form.groups).length === 0) {
    // Default the forms groups with a start and an end group
    const elementIds = form.elements.map((element) => String(element.id));

    const groups = {
      start: {
        name: "Start",
        elements: [...elementIds],
      },
    };

    form.groups = groups;
  }
  return form;
};
