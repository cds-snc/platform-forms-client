import {
  Responses,
  FormElement,
  FormElementTypes,
  ValidationProperties,
  FileInputResponse,
  DateObject,
} from "@gcforms/types";

import { isInputTooLong } from "./text";
import { isValidDate } from "./date";
import { getRegexByType } from "./regex";
import { isFileExtensionValid, isIndividualFileSizeValid } from "./file";
import { isSafeRegex } from "./regex";
import { isNumberInput } from "../utils/isNumberInput";

// Minimal translation function type to avoid i18next dependency
export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const isFieldResponseValid = (
  value: unknown,
  values: Responses,
  componentType: string,
  formElement: FormElement,
  validator: ValidationProperties,
  t: TranslateFn
): string | null | Record<string, unknown>[] => {
  // Note that this will ignore a file upload since the value is an object. We could check the
  // file's file name length but this is probably not necessary since OS's have a filename limit.
  if (isInputTooLong(value as string)) {
    return t("input-validation.too-many-characters");
  }

  switch (componentType) {
    case FormElementTypes.textField:
    case FormElementTypes.numberInput: {
      // Required check first
      const typedValue = String(value).trim();
      if (validator.required && !typedValue) return t("input-validation.required");

      // Handle NumberInput validation with backwards compatibility
      // for legacy number inputs that were stored as text fields
      // with validation.type "number"
      if (isNumberInput(formElement)) {
        // Number validation
        let currentRegex = getRegexByType("number", t);

        // Check if negative numbers are allowed.
        if (formElement.properties.allowNegativeNumbers) {
          currentRegex = getRegexByType("canBeNegativeNumber", t);
        }

        // Apply number validation
        if (currentRegex && currentRegex.regex) {
          const regex = new RegExp(currentRegex.regex);
          if (typedValue && !regex.test(typedValue)) {
            return currentRegex.error;
          }
        }

        if (typedValue) {
          const numericValue = Number(typedValue);

          // The number regex permits inputs like ".", ",", or whitespace which parse to NaN.
          // Treat any non-empty value that fails to parse as a number as invalid so it cannot
          // bypass the min/max checks below.
          if (Number.isNaN(numericValue)) {
            return currentRegex ? currentRegex.error : t("input-validation.number");
          }

          // MinValue and Max Value validation
          if (validator.minValue != null && numericValue < validator.minValue) {
            return t("input-validation.too-small", { min: String(validator.minValue) });
          }

          if (validator.maxValue != null && numericValue > validator.maxValue) {
            return t("input-validation.too-large", { max: String(validator.maxValue) });
          }

          // minDigits and maxDigits validation
          const digitCount = typedValue.replace(/[^\d]/g, "").length;
          if (validator.minDigits && digitCount < validator.minDigits) {
            return t("input-validation.too-few-digits");
          }

          if (validator.maxDigits && digitCount > validator.maxDigits) {
            return t("input-validation.too-many-digits");
          }
        }

        break;
      }

      const currentRegex = getRegexByType(validator.type, t, validator.regex);

      if (validator.type && currentRegex && currentRegex.regex) {
        // Check regex for safety before using it.
        if (!isSafeRegex(currentRegex.regex.source)) {
          return t("input-validation.invalidRegex");
        }

        // Check for different types of fields, email, date, custom etc
        const regex = new RegExp(currentRegex.regex);
        if (typedValue && !regex.test(typedValue)) {
          return currentRegex.error;
        }
      }

      if (validator.maxLength && (value as string).length > validator.maxLength) {
        return t("input-validation.too-many-characters");
      }

      break;
    }
    case FormElementTypes.textArea: {
      const typedValue = String(value).trim();
      if (validator.required && !typedValue) return t("input-validation.required");
      if (validator.maxLength && (value as string).length > validator.maxLength)
        return t("input-validation.too-many-characters");
      break;
    }
    case FormElementTypes.checkbox: {
      if (validator.required) {
        if (
          validator.all &&
          (value === undefined ||
            !Array.isArray(value) ||
            (value as Array<string>).length != formElement.properties.choices?.length)
        ) {
          return t("input-validation.all-checkboxes-required");
        } else {
          if (value === undefined || !Array.isArray(value) || !(value as Array<string>).length) {
            return t("input-validation.required");
          }
        }
      }
      break;
    }
    case FormElementTypes.radio:
    case FormElementTypes.dropdown: {
      if (validator.required && (value === undefined || value === "")) {
        return t("input-validation.required");
      }
      break;
    }
    case FormElementTypes.combobox: {
      const trimmedValue = String(value).trim();
      if (validator.required && (trimmedValue === undefined || trimmedValue === "")) {
        return t("input-validation.required");
      }
      break;
    }
    case FormElementTypes.fileInput: {
      const fileInputResponse = value as FileInputResponse;

      if (
        validator.required &&
        (!fileInputResponse || !fileInputResponse.name || !fileInputResponse.size)
      ) {
        return t("input-validation.required");
      }

      if (fileInputResponse.name && !isFileExtensionValid(fileInputResponse.name))
        return t("input-validation.file-type-invalid");

      // Check file size client-side
      if (fileInputResponse.size && !isIndividualFileSizeValid(fileInputResponse.size)) {
        return t("input-validation.file-size-too-large");
      }

      break;
    }
    case FormElementTypes.formattedDate: {
      if (validator.required && !value) {
        return t("input-validation.required");
      }

      if (value && !isValidDate(JSON.parse(value as string) as DateObject)) {
        return t("input-validation.date-invalid");
      }

      break;
    }
    case FormElementTypes.addressComplete: {
      if (validator.required && !value) {
        return t("input-validation.required");
      }

      break;
    }
    case FormElementTypes.dynamicRow: {
      // deterministic switch to return an error object or not
      // required because returning any object (including nulls) blocks the submit action
      let dynamicRowHasErrors = false;

      const groupErrors = (value as Array<Responses>).map((row) => {
        const rowErrors: Record<string, unknown> = {};

        (formElement.properties.subElements || []).forEach((subElement, index) => {
          if (subElement.properties.validation) {
            const validationError = isFieldResponseValid(
              row[index],
              values,
              subElement.type,
              subElement,
              subElement.properties.validation,
              t
            );

            if (validationError !== null) {
              rowErrors[index] = validationError;
              dynamicRowHasErrors = true;
            }
          }
        });

        return rowErrors;
      });

      if (dynamicRowHasErrors) {
        return groupErrors;
      }

      break;
    }
    case FormElementTypes.richText:
      break;
    default:
      throw `Validation for component ${componentType} is not handled`;
  }
  return null;
};
