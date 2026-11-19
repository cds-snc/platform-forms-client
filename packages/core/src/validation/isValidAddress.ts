import { AddressElements, ValidationProperties } from "@gcforms/types";

import type { AddressValidationError, ValidationError } from "./validationErrorTypes";

// Checks that the value has the expected address structure.
// Returns null for malformed inpuT. Missing fields are checked separately.
export const parseAddressResponse = (value: unknown): Partial<AddressElements> | null => {
  if (typeof value !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const record = parsed as Record<string, unknown>;
  for (const field of ["streetAddress", "city", "province", "postalCode", "country"]) {
    if (field in record && typeof record[field] !== "string") return null;
  }

  return record as Partial<AddressElements>;
};

export const isValidAddress = (
  value: unknown,
  validator: ValidationProperties
): ValidationError | AddressValidationError | null => {
  if (value === undefined || value === null || value === "") {
    return validator.required ? { code: "required" } : null;
  }

  const address = parseAddressResponse(value);
  if (address === null) return { code: "mismatched-type" };
  if (!validator.required) return null;

  const fields: AddressValidationError["fields"] = {
    streetAddress: address.streetAddress?.trim() ? null : { code: "required" },
    city: address.city?.trim() ? null : { code: "required" },
    province: address.province?.trim() ? null : { code: "required" },
    postalCode: address.postalCode?.trim() ? null : { code: "required" },
  };

  return Object.values(fields).some(Boolean) ? { fields } : null;
};

// These UI helpers use the string errors produced by the application's formatter
export const isValidAddressSubFieldInvalid = (error: unknown, fieldKey: string): boolean => {
  if (!error) return false;
  if (typeof error === "string") return true;
  if (
    typeof error === "object" &&
    error !== null &&
    "fields" in (error as Record<string, unknown>)
  ) {
    const obj = error as { fields: Record<string, string | null> };
    if (!obj.fields || typeof obj.fields !== "object" || obj.fields === null) return false;
    const fields = obj.fields as Record<string, string | null>;
    return Boolean(fields[fieldKey]);
  }
  return false;
};

export const getAddressSubFieldError = (error: unknown, fieldKey: string): string | null => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "fields" in (error as Record<string, unknown>)
  ) {
    const obj = error as { fields: Record<string, string | null> };
    if (!obj.fields || typeof obj.fields !== "object" || obj.fields === null) return null;
    const fields = obj.fields as Record<string, string | null>;
    return fields[fieldKey] || null;
  }
  return null;
};
