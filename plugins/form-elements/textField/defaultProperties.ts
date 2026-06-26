import type { FormElement } from "@lib/types";

/** Default properties for a newly created textField element. */
export const defaultProperties: Partial<FormElement["properties"]> = {
  questionId: "",
  tags: [],
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
};
