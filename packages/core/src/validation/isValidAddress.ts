import { ValidationProperties } from "@gcforms/types";
import { sanitizeField } from "../helpers";

export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export type AddressValidationError = {
  fields: {
    streetAddress: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  };
};

export const isValidAddress = (
  value: unknown,
  validator: ValidationProperties,
  t: TranslateFn
): string | AddressValidationError | null => {
  if (validator.required) {
    if (!value) return t("input-validation.required");

    try {
      const parsed: unknown = JSON.parse(String(value));
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        const street = sanitizeField(record.streetAddress);
        const city = sanitizeField(record.city);
        const province = sanitizeField(record.province);
        const postal = sanitizeField(record.postalCode);

        const fields = {
          streetAddress: street ? null : t("input-validation.required"),
          city: city ? null : t("input-validation.required"),
          province: province ? null : t("input-validation.required"),
          postalCode: postal ? null : t("input-validation.required"),
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

export const isValidAddressSubFieldInvalid = (error: unknown, fieldKey: string): boolean => {
  if (!error) return false;
  if (typeof error === "string") return true;
  if (
    typeof error === "object" &&
    error !== null &&
    "fields" in (error as Record<string, unknown>)
  ) {
    const obj = error as AddressValidationError;
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
    const obj = error as AddressValidationError;
    if (!obj.fields || typeof obj.fields !== "object" || obj.fields === null) return null;
    const fields = obj.fields as Record<string, string | null>;
    return fields[fieldKey] || null;
  }
  return null;
};
