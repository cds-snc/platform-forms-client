import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";
import { getFormattedDateFromObject } from "@clientComponents/forms/FormattedDate/utils";
import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";

export const toString = (value: Response, _language: Language): string => {
  const dateObject = safeJSONParse(value as string) as DateObject;
  if (!dateObject) return String(value ?? "");
  const format = Object.keys(dateObject).join("-") as DateFormat;
  return getFormattedDateFromObject(format, dateObject);
};
