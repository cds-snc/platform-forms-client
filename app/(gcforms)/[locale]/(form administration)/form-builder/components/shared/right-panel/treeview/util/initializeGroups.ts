import { FormProperties } from "@lib/types/form-types";

export const initializeGroups = (form: FormProperties, allowGroups: boolean): FormProperties => {
  // Clean and remove any existing groups
  if (!allowGroups) {
    form.groups = {};
    return form;
  }

  if (!form.groups) {
    form.groups = {};
  }

  // Check if the form groups is an empty object
  if (form.groups && Object.keys(form.groups).length === 0) {
    // TODO check for elements also

    // Default the forms groups with a start and an end group
    // also do not push the Review element into the start group (10000000000001 is the Review Id)
    const elementIds = form.elements.filter((element) => String(element.id) !== String(10000000000001)).map((element) => String(element.id));

    const groups = {
      start: {
        name: "Start",
        elements: [...elementIds],
      },
      review: {
        name: "Review",
        elements: ["10000000000001"],
        nextAction: "end",
      },
    };

    form.groups = groups;
  }
  return form;
};
