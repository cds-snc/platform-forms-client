import type { Language } from "@lib/types/form-builder-types";
import type { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";
import { AddressElements } from "@clientComponents/forms/AddressComplete/types";
import { getAddressAsString } from "@clientComponents/forms/AddressComplete/utils";

export const toString = (value: Response, _language: Language): string => {
  const addressValues = safeJSONParse(value as string) as AddressElements;
  if (!addressValues) return String(value ?? "");
  return getAddressAsString(addressValues);
};
