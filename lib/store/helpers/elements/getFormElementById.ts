import { type TemplateStore } from "../../types";

export const getFormElementById: TemplateStore<"getFormElementById"> = (set, get) => (id) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const elements = get().form.elements;

  for (const element of elements) {
    if (element.id === id) {
      return element;
    }

    if (element.properties?.subElements) {
      for (const subElement of element.properties.subElements) {
        if (subElement && subElement.id === id) {
          return subElement;
        }
      }
    }
  }

  return undefined;
};
