import { FormElement, FormElementTypes } from "../types";

export const defaultField: FormElement = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    subElements: [],
    choices: [{ en: "", fr: "" }],
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
};

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
  groups: {},
};
