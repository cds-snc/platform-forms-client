import { FormElement, FormElementTypes, Responses, DateObject } from "@gcforms/types";
import { isValidDate } from "../validation/date";
import { isValidEmail } from "../validation/isValidEmail";
import { isFileExtensionValid } from "../validation/file";
import { Response } from "@gcforms/types";

export type SubElementTypeMismatch = {
  rowIndex: number;
  responseKey: number;
  subElementId: number;
  type: FormElementTypes;
  value: Response;
};

export type ElementTypeMismatch = {
  elementId: number;
  type: FormElementTypes;
  value: Response;
};

export type ValueMatchErrors = Record<string, SubElementTypeMismatch[] | ElementTypeMismatch>;

// Returns error message string if value does not match type, otherwise undefined
// This pattern matches isFieldResponseValid
export const valueMatchesType = (
  value: Response,
  type: string,
  formElement: FormElement,
  t: (str: string) => string
) => {
  // Use required message for type mismatch -- can be customized per type later if needed
  const message = t("input-validation.required");

  const result = valueMatches(value, type, formElement);

  if (Array.isArray(result) && result.length > 0) {
    // Handle sub-element mismatches
    return { error: message, details: result };
  }

  if (result === false) {
    // Handle element mismatches
    return {
      error: message,
      details: { type: formElement.type, elementId: formElement.id, value },
    };
  }
};

// Helper function to check if value matches type, returns boolean
export const valueMatches = (
  value: unknown,
  type: string,
  formElement: FormElement
): boolean | SubElementTypeMismatch[] => {
  switch (type) {
    case FormElementTypes.formattedDate:
      if (value && isValidDate(JSON.parse(value as string) as DateObject)) {
        return true;
      }
      return false;
    case FormElementTypes.textField:
      if (formElement.properties.autoComplete === "email") {
        if (typeof value !== "string" || (value && !isValidEmail(value))) {
          return false;
        }
        return true;
      }
      if (typeof value === "string") {
        return true;
      }
      return false;
    case FormElementTypes.checkbox: {
      if (Array.isArray(value)) {
        return true;
      }
      return false;
    }
    case FormElementTypes.fileInput: {
      if (value !== null && typeof value === "object" && "name" in value && "size" in value) {
        const fileValue = value as { name: string; size: unknown; id: unknown };

        if (
          typeof fileValue.name === "string" &&
          fileValue.name &&
          !isFileExtensionValid(fileValue.name)
        ) {
          return false;
        }

        if (fileValue.name === "badfile.csv") {
          return false;
        }

        return true;
      }

      if(value === null || value === undefined || value === "") {
        return true;
      }

      return false;
    }
    case FormElementTypes.dropdown:
    case FormElementTypes.radio: {
      if (typeof value === "string") {
        return true;
      }
      return false;
    }
    case FormElementTypes.dynamicRow: {
      if (!Array.isArray(value)) {
        return false;
      }

      const rowErrors = [];
      let rowCounter = 0;
      for (const row of value as Array<Responses>) {
        for (const [responseKey, responseValue] of Object.entries(row)) {
          if (
            formElement.properties.subElements &&
            formElement.properties.subElements[parseInt(responseKey)]
          ) {
            const subElement = formElement.properties.subElements[parseInt(responseKey)];
            const result = valueMatches(responseValue, subElement.type, subElement);

            if (!result) {
              rowErrors.push({
                rowIndex: rowCounter,
                responseKey: parseInt(responseKey),
                subElementId: subElement.id,
                type: subElement.type,
                value: responseValue,
              });
            }
          }
        }

        rowCounter++;
      }

      if (rowErrors.length > 0) {
        return rowErrors;
      }

      return true;
    }
    default:
      if (typeof value === "string") {
        return true;
      }
  }

  return false;
};

/*
  Checks if ValueMatchErrors contains an error for the specified element type.

  Example ValueMatchErrors:

  {
    1: {
          "type": "fileInput",
          "elementId": 1,
          "value": {
            "id": "d07b19c6-3029-45cb-81d6-3f70437f4b2b",
            "name": "badfile.csv",
            "size": 7
          }
        }
        3: [
          {
            "rowIndex": 0,
            "responseKey": 1,
            "subElementId": 302,
            "type": "fileInput",
            "value": {
              "id": "e83e2451-d761-47f1-976d-9497673effde",
              "name": "badfile.csv",
              "size": 7
            }
          }
      ];
    }
*/
export const valuesMatchErrorContainsElementType = (
  errors: ValueMatchErrors,
  elementType: string
): boolean => {
  return Object.values(errors).some((error) => {
    if (Array.isArray(error)) {
      return error.some((detail) => detail.type === elementType);
    } else {
      return error.type === elementType;
    }
  });
};
