import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";

/** Returns the textField response as a plain string (no transformation needed). */
export const toString = (value: Response, _language: Language): string => value as string;
