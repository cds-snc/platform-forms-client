import { type TemplateStore } from "../../types";
import { getSubElements } from "@gcforms/core";

export const getFormElementById: TemplateStore<"getFormElementById"> = (set, get) => (id) => {
  if (!get) {
    throw new Error("get is not defined");
  }

  const elements = get().form.elements;

  for (const element of elements) {
    if (element.id === id) {
      return element;
    }

    const subElements = getSubElements(element);
    if (subElements) {
      for (const subElement of subElements) {
        if (subElement && subElement.id === id) {
          return subElement;
        }
      }
    }
  }

  return undefined;
};
