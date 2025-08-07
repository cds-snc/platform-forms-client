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

  // Loop over each response object fill in missing keys with empty strings
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

const fillData = (value: Response | Responses[], element: FormElement) => {
  const fillers = {
    dynamicRow: dynamicRowFiller,
    checkbox: checkboxFiller,
    fileInput: fileInputFiller,
  };

  const filler = fillers[element?.type as keyof typeof fillers];

  if (!filler) {
    return value;
  }

  return filler(value, element);
};

export const buildCompleteFormDataObject = (formRecord: PublicFormRecord, values: Responses) => {
  const originalValues = JSON.parse(JSON.stringify(values)) as Responses;
  const formData = { ...originalValues };

  Object.keys(formData).forEach((key) => {
    // find the elements key in the formRecord.form.elements
    const element = formRecord.form.elements.find((el) => String(el.id) === key);

    // If the element is not found, preserve user submitted value just in case
    // * Should only be possible in draft forms.
    if (!element) {
      formData[key] = originalValues[key];
      return;
    }

    formData[key] = fillData(originalValues[key], element);
  });

  formRecord.form.elements.forEach((element) => {
    if (element.type === FormElementTypes.richText) {
      return;
    }

    if (!formData[element.id]) {
      formData[element.id] = "";
      formData[element.id] = fillData(formData[element.id], element);
    }
  });

  formData["formID"] = formRecord.id;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
};
