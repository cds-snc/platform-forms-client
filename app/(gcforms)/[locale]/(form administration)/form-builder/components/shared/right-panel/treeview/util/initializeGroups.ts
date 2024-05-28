import { FormProperties } from "@lib/types/form-types";
import { LockedSections } from "../types";

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
    // Default the forms groups with a start and an end group
    const elementIds = form.elements.map((element) => String(element.id));

    const groups = {
      start: {
        name: "Start",
        titleEn: "",
        titleFr: "",
        elements: [...elementIds],
        nextAction: LockedSections.REVIEW,
      },
    };

    form.groups = groups;
  }

  form.groups.review = {
    name: "Review",
    titleEn: "",
    titleFr: "",
    elements: [],
    nextAction: "end",
  };

  form.groups.end = {
    name: "End",
    titleEn: "",
    titleFr: "",
    elements: [],
  };

  return form;
};
