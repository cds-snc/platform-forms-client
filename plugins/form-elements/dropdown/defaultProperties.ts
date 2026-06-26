import type { FormElement } from "@lib/types";
import { SortOption } from "@gcforms/types";

export const defaultProperties: Partial<FormElement["properties"]> = {
  titleEn: "",
  titleFr: "",
  choices: [
    { en: "", fr: "" },
    { en: "", fr: "" },
  ],
  sortOrder: SortOption.NONE,
};
