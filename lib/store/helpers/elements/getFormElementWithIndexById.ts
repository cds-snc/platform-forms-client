import { type TemplateStore } from "../../types";
import { getSubElements } from "@gcforms/core";

export const getFormElementWithIndexById: TemplateStore<"getFormElementWithIndexById"> =
  (set, get) => (id) => {
    if (!get) {
      throw new Error("get is not defined");
    }

    const elements = get().form.elements;

    // for (const element of elements) {
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      if (element.id === id) {
        return { ...element, index };
      }

      const subElements = getSubElements(element);
      if (subElements) {
        for (let subIndex = 0; subIndex < subElements.length; subIndex++) {
          const subElement = subElements[subIndex];
          if (subElement && subElement.id === id) {
            return { ...subElement, index: subIndex };
          }
        }
      }
    }

    return undefined;
  };
