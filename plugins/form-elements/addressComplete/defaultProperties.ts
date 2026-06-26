import type { FormElement } from "@lib/types";

export const defaultProperties: Partial<FormElement["properties"]> = {
  titleEn: "",
  titleFr: "",
  addressComponents: {
    splitAddress: false,
    canadianOnly: false,
  },
};
