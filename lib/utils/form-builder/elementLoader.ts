import { FormElement, FormElementTypes } from "@lib/types";

// Helper to check property existence
const has = (obj: object, prop: string) => Object.prototype.hasOwnProperty.call(obj, prop);

export const validateElement = (element: unknown) => {
  // Accepts any JS object, but expects a FormElement shape at runtime

  if (!element || typeof element !== "object") {
    throw new Error("Element must be an object");
  }

  // Type assertion for runtime checks
  const el = element as { type?: unknown; properties?: unknown };

  // check that element had a valid type - FormElementTypes
  if (!("type" in el) || typeof el.type !== "string") {
    throw new Error("Element type is required");
  }
  if (!Object.values(FormElementTypes).includes(el.type as FormElementTypes)) {
    throw new Error("Element type is invalid");
  }

  if (!("properties" in el) || typeof el.properties !== "object" || el.properties === null) {
    throw new Error("Element properties are required");
  }

  // check for titleEn and titleFr
  if (!has(el.properties as object, "titleEn") || !has(el.properties as object, "titleFr")) {
    throw new Error("Element properties must have titleEn and titleFr");
  }

  // Additional validation based on element type
  switch (el.type) {
    case "radio":
    case "checkbox":
    case "dropdown":
    case "combobox":
      if (
        !has(el.properties as object, "choices") ||
        !Array.isArray((el.properties as { choices?: unknown }).choices)
      ) {
        throw new Error(`Element of type ${el.type} must have a 'choices' array in properties`);
      }
      (el.properties as { choices: unknown[] }).choices.forEach((choice, idx) => {
        if (
          typeof choice !== "object" ||
          choice === null ||
          !has(choice, "en") ||
          !has(choice, "fr")
        ) {
          throw new Error(`Choice at index ${idx} in ${el.type} is missing 'en' or 'fr'`);
        }
      });
      break;
    default:
      // No extra validation for other types
      break;
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
