import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";
import { removeElementById } from "@lib/utils/form-builder";

export const removeSubItem: TemplateStore<"removeSubItem"> = (set) => (elId, elementId) => {
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);

    if (parentIndex === undefined) return;

    const parentProperties = state.form.elements[parentIndex]
      .properties as ElementProperties<"dynamicRow">;
    const subElements = parentProperties.subElements;
    if (subElements) {
      parentProperties.subElements = removeElementById(subElements, elementId);
    }
  });
};
