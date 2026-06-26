import type { FormElement } from "@lib/types";

/** richText elements contain only markup content — no response-related fields. */
export const defaultProperties: Partial<FormElement["properties"]> = {
  questionId: "",
  tags: [],
  subElements: [],
  choices: [],
  titleEn: "",
  titleFr: "",
  descriptionEn: "",
  descriptionFr: "",
};
