import { isSafeRegex, isValidRegex } from "@gcforms/core";
import { FormElement, ValidationTextInput } from "../types";

export const validateCustomRegex = (elements: FormElement[]) => {
  for (const element of elements) {
    const validation = element.properties.validation as ValidationTextInput | undefined;
    if (validation?.type === "custom" && validation.regex) {
      const regex = validation.regex;

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
