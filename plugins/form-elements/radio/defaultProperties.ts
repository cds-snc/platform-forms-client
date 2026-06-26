import type { FormElement } from "@lib/types";

export const defaultProperties: Partial<FormElement["properties"]> = {
  titleEn: "",
  titleFr: "",
  choices: [
    { en: "", fr: "" },
    { en: "", fr: "" },
  ],
};
