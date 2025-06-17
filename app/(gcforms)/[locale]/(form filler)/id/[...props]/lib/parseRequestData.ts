import {
  FileInputResponse,
  PublicFormRecord,
  Responses,
  FormElement,
  FormElementTypes,
  Response,
} from "@lib/types";

interface FileInput extends FileInputResponse {
  name: string;
  size: number;
  key: string;
}

const isFileResponse = (response: unknown): response is FileInput => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "key" in response
  );
};

/**
 * This function takes a partial form submission and ensures every form template element has a corresponding value.
 */

export const buildCompleteFormDataObject = (formRecord: PublicFormRecord, values: Responses) => {
  // Remove rich text elements from the form elements

  const pureFormElements = formRecord.form.elements.reduce((acc: FormElement[], element) => {
    if (FormElementTypes.richText === element.type) {
      return acc;
    }

    if (FormElementTypes.dynamicRow === element.type) {
      const newSubElements = element.properties.subElements?.filter(
        (subElement) => FormElementTypes.richText !== subElement.type
      );
      element.properties.subElements = newSubElements ?? [];
      acc.push(element);
    }
    acc.push(element);
    return acc;
  }, []);

  // Build the complete form data object by adding values for each form element
  const formData: { [key: string]: Response } = {};
  const fileKeys: string[] = [];
  pureFormElements.forEach((element) => {
    emptyDataFiller(element, values, formData, fileKeys);
  });

  formData["formID"] = `${formRecord.id}`;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return { formData, fileKeys };
};

const emptyDataFiller = (
  element: FormElement,
  values: Responses,
  formAccumulator: { [key: string]: Response },
  fileKeys: string[]
) => {
  if (element.type === FormElementTypes.dynamicRow) {
    // If the dynamic row is not filled, we need to create an empty array for it
    if (values[element.id] === undefined || values[element.id] === "") {
      // Create a single empty data entry for the dynamic row
      const emptyDataEntry: { [key: string]: string } = {};
      element.properties.subElements?.forEach((subElement) => {
        emptyDataFiller(subElement, values[element.id] as Responses, emptyDataEntry, fileKeys);
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
        emptyDataFiller(correctedElement, response, dataEntry, fileKeys);
      });
      return dataEntry;
    });
    return;
  }

  // For File Input elements only keep the file path or set to an empty string if not filled
  if (element.type === FormElementTypes.fileInput) {
    if (values[element.id] === undefined || values[element.id] === "") {
      formAccumulator[element.id] = "";
      return;
    }
    const fileInputResponse = values[element.id] as FileInput;
    if (isFileResponse(values[element.id])) {
      formAccumulator[element.id] = fileInputResponse.key;
      // Store the file key for later processing (e.g., deletion if needed)
      fileKeys.push(fileInputResponse.key);
      return;
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
  }

  formAccumulator[element.id] = values[element.id] as Response;
};
