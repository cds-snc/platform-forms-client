import { FormProperties } from "@lib/types/form-types";
import { LockedSections } from "../types";
import { getStartLabels, getReviewLabels, getEndLabels } from "@lib/utils/form-builder/i18nHelpers";

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

    // i18n
    const groups = {
      start: {
        name: "Start",
        titleEn: getStartLabels().en,
        titleFr: getStartLabels().fr,
        elements: [...elementIds],
        nextAction: LockedSections.REVIEW,
      },
    };

    form.groups = groups;
  }

  // i18n
  if (!form.groups.review) {
    form.groups.review = {
      name: "Review",
      titleEn: getReviewLabels().en,
      titleFr: getReviewLabels().fr,
      elements: [],
      nextAction: "end",
    };
  }

  // i18n
  if (!form.groups.end) {
    form.groups.end = {
      name: "End",
      titleEn: getEndLabels().en,
      titleFr: getEndLabels().fr,
      elements: [],
    };
  }

  return form;
};
