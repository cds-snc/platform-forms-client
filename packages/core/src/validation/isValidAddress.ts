import { ValidationProperties } from "@gcforms/types";

export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const isValidAddress = (
  value: unknown,
  validator: ValidationProperties,
  t: TranslateFn
): string | null => {
  if (validator.required) {
    if (!value) return t("input-validation.required");

    try {
      const parsed: unknown = JSON.parse(String(value));
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        const street = String(record.streetAddress ?? "").trim();
        const city = String(record.city ?? "").trim();
        const province = String(record.province ?? "").trim();
        const postal = String(record.postalCode ?? "").trim();

        if (!street || !city || !province || !postal) {
          return t("input-validation.required");
        }
      }
    } catch (e) {
      // If parse fails, fall back to the simple empty check above.
    }
  }

  return null;
};
