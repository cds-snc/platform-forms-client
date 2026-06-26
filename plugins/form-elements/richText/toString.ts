import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";

/** richText elements have no response value — always returns empty string. */
export const toString = (_value: Response, _language: Language): string => "";
