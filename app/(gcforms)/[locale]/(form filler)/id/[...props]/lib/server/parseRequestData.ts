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
const dynamicRowFiller = (element: FormElement, values: Responses[]) => {
  const subElements = element.properties.subElements || [];

  // If the values are not an array, we need to create an empty array for it
  const newValues = [...values];

  // Loop over each response object fill in missing keys with empty strings
  newValues.forEach((value) => {
    subElements.forEach((subElement, index) => {
      // if the sub element is rich text, we skip it
      if (subElement.type === FormElementTypes.richText) {
        return;
      }

      if (subElement.type === FormElementTypes.fileInput) {
        // If the sub-element is a file input, we need to ensure it has a valid structure
        value[index] = fileInputFiller(value[index]);
      }

      if (subElement.type === FormElementTypes.checkbox) {
        // Ensure checkboxes always return an array
        value[index] = checkboxFiller(value[index]);
      }

      // Check to see if the sub-element key exists in the response object
      if (!(index in value)) {
        // Add the missing sub-element key to the response value as an empty string
        value[index] = "";
      }
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

export const buildCompleteFormDataObject = (formRecord: PublicFormRecord, values: Responses) => {
  const originalValues = JSON.parse(JSON.stringify(values)) as Responses;
  const formData = { ...originalValues };

  Object.keys(formData).forEach((key) => {
    // find the elements key in the formRecord.form.elements
    const element = formRecord.form.elements.find((el) => String(el.id) === key);

    if (!element) {
      formData[key] = ""; // should we discard?
    }

    if (Array.isArray(formData[key])) {
      if (element?.type === FormElementTypes.dynamicRow) {
        formData[key] = dynamicRowFiller(element, originalValues[key] as Responses[]);
      }
    }

    if (element?.type === FormElementTypes.fileInput) {
      formData[key] = fileInputFiller(originalValues[key]);
    }

    if (element?.type === FormElementTypes.checkbox) {
      // Ensure checkboxes always return an array
      formData[key] = checkboxFiller(originalValues[key]);
    }
  });

  formRecord.form.elements.forEach((element) => {
    if (!formData[element.id]) {
      if (
        element.type === FormElementTypes.dynamicRow ||
        element.type === FormElementTypes.checkbox
      ) {
        formData[element.id] = [];
        return;
      }
      if (element.type === FormElementTypes.fileInput) {
        formData[element.id] = fileInputFiller({});
        return;
      }
      formData[element.id] = "";
    }
  });

  formData["formID"] = formRecord.id;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
};
