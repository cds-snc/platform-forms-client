import {
  FileInputResponse,
  PublicFormRecord,
  Responses,
  FormElement,
  FormElementTypes,
  Response,
} from "@lib/types";

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
const dynamicRowFiller = (values: Responses[], element: FormElement) => {
  const subElements = element.properties.subElements || [];

  // If the values are not an array, we need to create an empty array for it
  const newValues = [...values];

  // Loop over each response object fill in missing sub-element keys with empty strings
  newValues.forEach((value) => {
    subElements.forEach((subElement, index) => {
      // if the sub element is rich text, we skip it
      if (subElement.type === FormElementTypes.richText) {
        return;
      }

      // Check to see if the sub-element key exists in the response object
      if (!(index in value)) {
        // Add the missing sub-element key to the response value as an empty string
        value[index] = "";
      }

      value[index] = fillData(value[index], subElement);
    });
  });

  return newValues;
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

export const checkboxFiller = (value: Response) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
};

/*
 * Centralized filling logic for form elements.
 * This function takes a response value and an element,
 * and fills in the response value based on the element type.
 */
const fillData = (value: Response | Responses[], element: FormElement) => {
  switch (element?.type) {
    case "dynamicRow":
      return dynamicRowFiller(value as Responses[], element);
    case "checkbox":
      return checkboxFiller(value as Response);
    case "fileInput":
      return fileInputFiller(value as Response);
    default:
      return value;
  }
};

export const buildCompleteFormDataObject = (formRecord: PublicFormRecord, values: Responses) => {
  const originalValues = JSON.parse(JSON.stringify(values)) as Responses;
  const formData = { ...originalValues };

  // Ensure all submitted formDFata has the correct data shape
  Object.keys(formData).forEach((key) => {
    // Look for the matching element in the formRecord.form.elements
    const element = formRecord.form.elements.find((el) => String(el.id) === key);

    // If the element is not found, preserve user submitted value just in case
    // * Should only be possible in draft forms.
    if (!element) {
      formData[key] = originalValues[key];
      return;
    }

    formData[key] = fillData(originalValues[key], element);
  });

  // Process elements that don't already exist in formData and aren't richText
  const missingElements = formRecord.form.elements.filter(
    (element) => element.type !== FormElementTypes.richText && !formData[element.id]
  );

  missingElements.forEach((element) => {
    formData[element.id] = fillData("", element);
  });

  formData["formID"] = formRecord.id;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
};
