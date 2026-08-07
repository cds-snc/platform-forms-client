import type { FormElement } from "@lib/types";
import { HTMLTextInputTypeAttribute } from "@lib/types";

const SPELL_CHECK_OFF_AUTO_COMPLETE_VALUES = [
  "email",
  "name",
  "tel",
  "given-name",
  "additional-name",
  "family-name",
  "address-line1",
  "address-level2",
  "address-level1",
  "postal-code",
] as const;

export const getTextInputType = (
  element: FormElement
): Exclude<HTMLTextInputTypeAttribute, "number"> => {
  const validationType = element.properties?.validation?.type;
  return validationType &&
    ["email", "name", "password", "search", "tel", "url"].includes(validationType)
    ? (validationType as Exclude<HTMLTextInputTypeAttribute, "number">)
    : "text";
};

// Returns false (disable spellcheck) for field types where it would be noise; undefined otherwise.
export const getSpellCheck = (element: FormElement): false | undefined => {
  const autoComplete = element.properties?.autoComplete;
  return autoComplete && SPELL_CHECK_OFF_AUTO_COMPLETE_VALUES.includes(autoComplete as never)
    ? false
    : undefined;
};
