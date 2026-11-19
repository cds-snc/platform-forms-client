import { ValidationProperties } from "@gcforms/types";

import type { AddressValidationError, ValidationError } from "./validationErrorTypes";

export const isValidAddress = (
  value: unknown,
  validator: ValidationProperties
): ValidationError | AddressValidationError | null => {
  if (validator.required) {
    if (!value) return { code: "required" };

    try {
      const parsed: unknown = JSON.parse(String(value));
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        const street = String(record.streetAddress ?? "").trim();
        const city = String(record.city ?? "").trim();
        const province = String(record.province ?? "").trim();
        const postal = String(record.postalCode ?? "").trim();

        const fields: AddressValidationError["fields"] = {
          streetAddress: street ? null : { code: "required" },
          city: city ? null : { code: "required" },
          province: province ? null : { code: "required" },
          postalCode: postal ? null : { code: "required" },
        };

        const missingKeys = Object.keys(fields).filter(
          (k) => (fields as Record<string, unknown>)[k]
        );

        if (missingKeys.length) {
          return {
            fields: fields,
          };
        }
      }
    } catch (e) {
      // If parse fails, treat as present (don't mark as missing subfields)
    }
  }

  return null;
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
