import {
  Responses,
  FormElement,
  FormElementTypes,
  ValidationProperties,
  FileInputResponse,
  DateObject,
} from "@gcforms/types";

import { isInputTooLong, inputLengthOverLimit } from "./text";
import { isValidDate } from "./date";
import { getRegexByType } from "./regex";
import { isFileExtensionValid, isIndividualFileSizeValid, MAX_FILE_SIZE } from "./file";
import { isSafeRegex } from "./regex";
import { isNumberInput } from "../utils/isNumberInput";
import { isValidAddress } from "./isValidAddress";
import type { FieldValidationResult, ValidationErrors } from "./validationErrorTypes";

// Number.MAX_SAFE_INTEGER (9,007,199,254,740,991) has 16 digits — the largest integer JS
// can represent exactly. This hard cap (independent of any form-configured maxDigits) keeps
// every accepted NumberInput value exactly representable, regardless of how it was submitted.
export const MAX_NUMBER_INPUT_DIGITS = 15;

export const isFieldResponseValid = (
  value: unknown,
  formElement: FormElement
): FieldValidationResult => {
  // Note that this will ignore a file upload since the value is an object. We could check the
  // file's file name length but this is probably not necessary since OS's have a filename limit.
  if (isInputTooLong(value as string)) {
    const countInputLengthOverLimit = inputLengthOverLimit(value as string);
    return { code: "input-too-long", count: countInputLengthOverLimit };
  }

  const componentType = formElement.type;
  const validator = formElement.properties.validation as ValidationProperties;

  switch (componentType) {
    case FormElementTypes.textField:
    case FormElementTypes.numberInput: {
      // Required check first
      const typedValue = String(value).trim();
      if (validator.required && !typedValue) return { code: "required" };

      // Handle NumberInput validation with backwards compatibility
      // for legacy number inputs that were stored as text fields
      // with validation.type "number"
      if (isNumberInput(formElement)) {
        // Number validation
        let currentRegex = getRegexByType("number");

        // Check if negative numbers are allowed.
        if (formElement.properties.allowNegativeNumbers) {
          currentRegex = getRegexByType("canBeNegativeNumber");
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
            return currentRegex ? currentRegex.error : { code: "invalid-number" };
          }

          // MinValue and Max Value validation
          if (validator.minValue != null && numericValue < validator.minValue) {
            return { code: "min-value", min: validator.minValue };
          }

          if (validator.maxValue != null && numericValue > validator.maxValue) {
            return { code: "max-value", max: validator.maxValue };
          }

          // minDigits and maxDigits validation
          const digitCount = typedValue.replace(/[^\d]/g, "").length;
          if (validator.minDigits && digitCount < validator.minDigits) {
            return { code: "min-digits" };
          }

          if (validator.maxDigits && digitCount > validator.maxDigits) {
            return { code: "max-digits" };
          }

          // Hard cap, independent of any form-configured maxDigits
          if (digitCount > MAX_NUMBER_INPUT_DIGITS) {
            return { code: "max-digits" };
          }
        }

        break;
      }

      const currentRegex = getRegexByType(validator.type, validator.regex);

      if (validator.type && currentRegex && currentRegex.regex) {
        // Check regex for safety before using it.
        if (!isSafeRegex(currentRegex.regex.source)) {
          return { code: "unsafe-regex" };
        }

        // Check for different types of fields, email, date, custom etc
        const regex = new RegExp(currentRegex.regex);
        if (typedValue && !regex.test(typedValue)) {
          return currentRegex.error;
        }
      }

      if (validator.maxLength && (value as string).length > validator.maxLength) {
        return {
          code: "max-length",
          count: (value as string).length - validator.maxLength,
        };
      }

      break;
    }
    case FormElementTypes.textArea: {
      const typedValue = String(value).trim();
      if (validator.required && !typedValue) return { code: "required" };
      if (validator.maxLength && (value as string).length > validator.maxLength)
        return {
          code: "max-length",
          count: (value as string).length - validator.maxLength,
        };
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
          return { code: "all-checkboxes-required" };
        } else {
          if (value === undefined || !Array.isArray(value) || !(value as Array<string>).length) {
            return { code: "required" };
          }
        }
      }
      break;
    }
    case FormElementTypes.radio:
    case FormElementTypes.starRating:
    case FormElementTypes.dropdown: {
      if (validator.required && (value === undefined || value === "")) {
        return { code: "required" };
      }
      break;
    }
    case FormElementTypes.combobox: {
      const trimmedValue = String(value).trim();
      if (validator.required && (trimmedValue === undefined || trimmedValue === "")) {
        return { code: "required" };
      }
      break;
    }
    case FormElementTypes.fileInput: {
      const fileInputResponse = value as FileInputResponse;

      if (
        validator.required &&
        (!fileInputResponse || !fileInputResponse.name || !fileInputResponse.size)
      ) {
        return { code: "required" };
      }

      if (fileInputResponse.name && !isFileExtensionValid(fileInputResponse.name))
        return { code: "invalid-file-type" };

      // Check file size client-side
      if (fileInputResponse.size && !isIndividualFileSizeValid(fileInputResponse.size)) {
        return { code: "file-too-large", maxSizeInMb: MAX_FILE_SIZE / 1024 / 1024 };
      }

      break;
    }
    case FormElementTypes.formattedDate: {
      if (validator.required && !value) {
        return { code: "required" };
      }

      if (value && !isValidDate(JSON.parse(value as string) as DateObject)) {
        return { code: "invalid-date" };
      }

      break;
    }
    case FormElementTypes.addressComplete: {
      const error = isValidAddress(value, validator);
      if (error) return error;
      break;
    }
    case FormElementTypes.dynamicRow: {
      // deterministic switch to return an error object or not
      // required because returning any object (including nulls) blocks the submit action
      let dynamicRowHasErrors = false;

      const groupErrors = (value as Array<Responses>).map((row) => {
        const rowErrors: ValidationErrors = {};

        (formElement.properties.subElements || []).forEach((subElement, index) => {
          if (subElement.properties.validation) {
            const validationError = isFieldResponseValid(row[index], subElement);

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
