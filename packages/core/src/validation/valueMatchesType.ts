import { FormElement, FormElementTypes, Responses, DateObject } from "@gcforms/types";
import { isValidDate } from "../validation/date";
import { isValidEmail } from "../validation/isValidEmail";
import { isFileExtensionValid } from "../validation/file";

export const valueMatchesType = (value: unknown, type: string, formElement: FormElement) => {
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

        return true;
      }
      return false;
    }
    case FormElementTypes.dropdown:
    case FormElementTypes.radio: {
      return true;
    }
    case FormElementTypes.dynamicRow: {
      if (!Array.isArray(value)) {
        return false;
      }

      let valid = true;

      for (const row of value as Array<Responses>) {
        for (const [responseKey, responseValue] of Object.entries(row)) {
          if (
            formElement.properties.subElements &&
            formElement.properties.subElements[parseInt(responseKey)]
          ) {
            const subElement = formElement.properties.subElements[parseInt(responseKey)];
            const result = valueMatchesType(responseValue, subElement.type, subElement);

            if (!result) {
              valid = false;
              break;
            }
          }
        }
      }

      return valid;
    }
    default:
      if (typeof value === "string") {
        return true;
      }
  }

  return false;
};
