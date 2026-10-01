import { FormElement, FormElementTypes } from "../types";

// seeds every possible per-type optional field; downstream type changes (createElement)
// determine which of them end up meaningful - see lib/utils/form-builder/itemHelper.ts
export const defaultField = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    subElements: [],
    choices: [],
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    descriptionEn: "",
    descriptionFr: "",
    placeholderEn: "",
    placeholderFr: "",
    conditionalRules: undefined,
  },
} as unknown as FormElement;

export const defaultForm = {
  titleEn: "",
  titleFr: "",
  introduction: {
    descriptionEn: "",
    descriptionFr: "",
  },
  privacyPolicy: {
    descriptionEn: "",
    descriptionFr: "",
  },
  confirmation: {
    descriptionEn: "",
    descriptionFr: "",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  layout: [],
  elements: [],
  lastGeneratedElementId: 0,
  groups: {},
};
