import type { FormElement } from "@lib/types";

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
};
