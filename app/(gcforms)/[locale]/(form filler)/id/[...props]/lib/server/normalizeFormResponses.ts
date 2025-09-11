import {
  FileInputResponse,
  PublicFormRecord,
  Responses,
  FormElement,
  FormElementTypes,
  Response,
} from "@lib/types";
import { isValidDateObject } from "@root/components/clientComponents/forms/FormattedDate/utils";
import { logMessage } from "@root/lib/logger";
import { DateObject } from "@root/packages/types/src";

interface FileInputObj extends FileInputResponse {
  name: string | null;
  size: number | null;
  id: string | null;
}

const isFileInputObj = (response: unknown): response is FileInputObj => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "id" in response
  );
};

/**
 * This function takes a dynamic row element and an array of response values,
 * and fills in any missing sub-element values with empty strings.
 */
const dynamicRowFiller = (values: Responses[], element: FormElement): Responses[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  const subElements = element.properties?.subElements || [];
  const newValues = [...values];

  newValues.forEach((value) => {
    if (!value || typeof value !== "object") {
      return;
    }

    subElements.forEach((subElement, index) => {
      if (subElement.type === FormElementTypes.richText) {
        return;
      }

      if (!(index in value)) {
        value[index] = "";
      }

      value[index] = fillData(value[index], subElement);
    });
  });

  return newValues;
};

/**
 * Deserialize a date object from a JSON string
 *
 * @param value
 * @returns DateObject | string
 */
export const deserializeDateObject = (value: string): DateObject | string => {
  try {
    const parsed = JSON.parse(value);

    if (isValidDateObject(parsed)) {
      return parsed;
    }
  } catch (e) {
    logMessage.info("Failed to parse date object", { value, error: e });
  }

  return value;
};

export const fileInputFiller = (value: Response) => {
  if (isFileInputObj(value)) {
    return value;
  }

  return {
    name: null,
    size: null,
    id: null,
  };
};

export const checkboxFiller = (value: Response): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

/*
 * Centralized filling logic for form elements.
 * This function takes a response value and an element,
 * and fills in the response value based on the element type.
 */
export const fillData = (
  value: Response | Responses[],
  element: FormElement
): Response | Responses[] => {
  if (!element?.type) {
    return value;
  }

  try {
    switch (element.type) {
      case FormElementTypes.dynamicRow:
        return dynamicRowFiller(
          Array.isArray(value) ? (value as Responses[]) : ([] as Responses[]),
          element
        );
      case FormElementTypes.checkbox:
        return checkboxFiller(value as Response);
      case FormElementTypes.fileInput:
        return fileInputFiller(value as Response);
      case FormElementTypes.formattedDate:
        if (typeof value === "string") {
          return deserializeDateObject(value);
        }
        return value;
      case FormElementTypes.address:
        // @TODO: deserialize address object as above
        return value;
      default:
        return value;
    }
  } catch (error) {
    return value;
  }
};

export const normalizeFormResponses = (
  formRecord: PublicFormRecord,
  originalValues: Responses
): Responses => {
  if (!formRecord?.form?.elements || !Array.isArray(formRecord.form.elements)) {
    throw new Error("Invalid form record: missing or invalid elements array");
  }

  if (!originalValues || typeof originalValues !== "object") {
    throw new Error("Invalid values: must be a valid object");
  }

  const formData = structuredClone<Responses>(originalValues);

  // Create a lookup map for better performance
  const elementMap = new Map(formRecord.form.elements.map((el) => [String(el.id), el]));

  // Ensure all submitted formData has the correct data shape
  Object.keys(formData).forEach((key) => {
    const element = elementMap.get(key);

    if (!element) {
      formData[key] = originalValues[key];
      return;
    }

    formData[key] = fillData(originalValues[key], element);
  });

  return formData;
};
