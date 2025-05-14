import { FormElement, FormElementTypes } from "@lib/types";

export const validateElement = (element: FormElement) => {
  // no need to check for id - it is auto generated

  // check that element had a valid type - FormElementTypes
  if (!element.type) {
    throw new Error("Element type is required");
  }
  if (!Object.values(FormElementTypes).includes(element.type)) {
    throw new Error("Element type is invalid");
  }

  if (!element.properties) {
    throw new Error("Element properties are required");
  }

  // check for titleEn and titleFr
  if (!element.properties.titleEn || !element.properties.titleFr) {
    throw new Error("Element properties must have titleEn and titleFr");
  }

  return true;
};

// Check if the element has a valid id
export const elementLoader = async (
  startIndex: number,
  onData: (data: FormElement, position: number) => void
) => {
  // Pull and parse the contents of the textarea that is in the element dialog
  // This textarea is used to load custom elements
  const el = document.getElementById("custom-elements") as HTMLTextAreaElement;
  if (el) {
    // get content of the textArea
    const content = el.value;

    // parse the content to JSON
    const data = JSON.parse(content);

    // validate the data
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data format");
    }

    // check if the data is an array
    if (!Array.isArray(data)) {
      validateElement(data);

      // call the handler with the parsed data
      onData(data, startIndex);

      return;
    }

    data.forEach((element: FormElement, index: number) => {
      // validate each element
      validateElement(element);
      // call the handler with the parsed data
      onData(element, startIndex + index);
    });
  }
};
