import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";

export const toString = (value: Response, _language: Language): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value ?? "");
};
