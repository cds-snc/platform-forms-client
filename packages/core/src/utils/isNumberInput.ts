import { FormElement, FormElementTypes, ValidationTextInput } from "@gcforms/types";

/**
 * Resolves the effective element type, handling backwards compatibility for
 * legacy templates that stored number inputs as textField with validation.type "number".
 */
export const isNumberInput = (element: FormElement): boolean => {
  const validation = element.properties.validation as ValidationTextInput | undefined;
  if (element.type === FormElementTypes.textField && validation?.type === "number") {
    return true;
  }

  return element.type === FormElementTypes.numberInput;
};
