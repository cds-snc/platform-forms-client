import { FormElement, FormElementTypes } from "@gcforms/types";

/**
 * Resolves the effective element type, handling backwards compatibility for
 * legacy templates that stored number inputs as textField with validation.type "number".
 */
export const isNumberInput = (element: FormElement): boolean => {
  if (
    element.type === FormElementTypes.textField &&
    element.properties.validation?.type === "number"
  ) {
    return true;
  }

  return element.type === FormElementTypes.numberInput;
};
