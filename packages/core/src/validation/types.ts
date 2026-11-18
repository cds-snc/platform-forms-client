export type ValidationError =
  | { code: "required" }
  | { code: "all-checkboxes-required" }
  | { code: "input-too-long"; count: number }
  | { code: "max-length"; count: number }
  | { code: "min-value"; min: number }
  | { code: "max-value"; max: number }
  | { code: "min-digits" }
  | { code: "max-digits" }
  | { code: "invalid-email" }
  | { code: "invalid-alphanumeric" }
  | { code: "invalid-number" }
  | { code: "invalid-date-format" }
  | { code: "invalid-date" }
  | { code: "invalid-phone" }
  | { code: "invalid-choice" }
  | { code: "pattern-mismatch" }
  | { code: "unsafe-regex" }
  | { code: "mismatched-type" }
  | { code: "invalid-file-type" }
  | { code: "invalid-file-content"; fileName: string }
  | { code: "file-too-large"; maxSizeInMb: number; fileName?: string };

export type AddressField = "streetAddress" | "city" | "province" | "postalCode";

export type StructuredAddressValidationError = {
  fields: Record<AddressField, ValidationError | null>;
};

// Array positions preserve row indexes. Empty maps represent rows without errors
export type RepeatingSetValidationErrors = ValidationErrors[];

export type FieldValidationError =
  ValidationError | StructuredAddressValidationError | RepeatingSetValidationErrors;

export type FieldValidationResult = FieldValidationError | null;

// Keys are question IDs at the top level and subelement indexes within repeating rows
export type ValidationErrors = {
  [key: string]: FieldValidationError;
};
