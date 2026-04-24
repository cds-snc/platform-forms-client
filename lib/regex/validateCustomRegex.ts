import { isSafeRegex, isValidRegex } from "@gcforms/core";
import { FormElement } from "../types";

export const validateCustomRegex = (elements: FormElement[]) => {
  for (const element of elements) {
    if (element.properties.validation?.type === "custom" && element.properties.validation.regex) {
      const regex = element.properties.validation.regex;

      if (!isValidRegex(regex)) {
        return false;
      }

      if (!isSafeRegex(regex)) {
        return false;
      }
    }
  }

  return true;
};
