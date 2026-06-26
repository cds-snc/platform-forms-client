import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";

export const toString = (value: Response, _language: Language): string => (value as string) ?? "";
