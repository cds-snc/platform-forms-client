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
 * This function takes a partial form submission and ensures every form template element has a corresponding value.
 */

const dynamicRowFiller = (element: FormElement, values: Responses[]) => {
  // Get the sub-elements of the dynamic row
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

      if (!(index in value)) {
        value[index] = "";
      }
    });
  });

  return newValues;
};

export const buildCompleteFormDataObject = (formRecord: PublicFormRecord, values: Responses) => {
  // TEST CODE
  const originalValues = { ...values };
  const newValues = { ...originalValues };

  Object.keys(newValues).forEach((key) => {
    if (Array.isArray(newValues[key])) {
      // find the elements key in the formRecord.form.elements
      const element = formRecord.form.elements.find((el) => String(el.id) === key);
      if (element?.type === FormElementTypes.dynamicRow) {
        newValues[key] = dynamicRowFiller(element, originalValues[key] as Responses[]);
      }
    }
  });
  // END TEST CODE

  const pureFormElements = formRecord.form.elements.reduce((acc: FormElement[], element) => {
    if (FormElementTypes.richText === element.type) {
      return acc;
    }
    // Dynamic rows can contain rich text elements, so we need to filter them out from the sub-elements
    if (FormElementTypes.dynamicRow === element.type) {
      const newSubElements = element.properties.subElements?.filter(
        (subElement) => FormElementTypes.richText !== subElement.type
      );
      element.properties.subElements = newSubElements ?? [];
      acc.push(element);
      return acc;
    }
    // For all other element types, add them to the accumulator
    acc.push(element);
    return acc;
  }, []);

  // Build the complete form data object by adding values for each form element
  const formData: { [key: string]: Response } = {};

  pureFormElements.forEach((element) => {
    emptyDataFiller(element, values, formData);
  });

  formData["formID"] = formRecord.id;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
};

const emptyDataFiller = (
  element: FormElement,
  values: Responses,
  formAccumulator: { [key: string]: Response }
) => {
  if (element.type === FormElementTypes.dynamicRow) {
    if (values[element.id] === undefined || values[element.id] === "") {
      // If the dynamic row is not filled, we need to create an empty array for it
      values[element.id] = [];
      // Create a single empty data entry for the dynamic row
      const emptyDataEntry: { [key: string]: string } = {};
      element.properties.subElements?.forEach((subElement) => {
        emptyDataFiller(subElement, values[element.id] as Responses, emptyDataEntry);
      });
      formAccumulator[element.id] = [emptyDataEntry];
      return;
    }

    // Ensure all sub-elements have an empty string if they were not filled
    if (!Array.isArray(values[element.id])) {
      throw Error(
        `Expected values for dynamic row element ${
          element.id
        } to be an array, but got ${typeof values[element.id]}`
      );
    }

    formAccumulator[element.id] = (values[element.id] as Responses[]).map((response) => {
      const dataEntry: { [key: string]: string } = {};
      element.properties.subElements?.forEach((subElement, index) => {
        // Sub-elements use the index of the dynamic row instead of the original ID
        const correctedElement = {
          ...subElement,
          id: index,
        };
        emptyDataFiller(correctedElement, response, dataEntry);
        // Ensure no undefined values in the data entry
        if (dataEntry[index] === undefined) {
          dataEntry[index] = "";
        }
      });
      return dataEntry;
    });
    return;
  }

  // For File Input elements only keep the file path or set to an empty string if not filled
  if (element.type === FormElementTypes.fileInput) {
    if (values[element.id] === undefined || values[element.id] === null) {
      formAccumulator[element.id] = {
        id: null,
        name: null,
        size: null,
      };
      return;
    }
    const fileInputResponse = values[element.id];
    if (isFileInputObj(fileInputResponse)) {
      formAccumulator[element.id] = fileInputResponse;
    } else {
      throw new Error(
        `Expected a FileInputResponse for element ${
          element.id
        }, but got ${typeof fileInputResponse}`
      );
    }
  }

  // For non-dynamic row elements, just set an empty string

  if (values[element.id] === undefined || values[element.id] === "") {
    formAccumulator[element.id] = "";
    return;
  }

  formAccumulator[element.id] = values[element.id] as Response;
};
