import { type TemplateStore } from "../../types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";
import { removeElementById } from "@lib/utils/form-builder";

export const removeSubItem: TemplateStore<"removeSubItem"> = (set) => (elId, elementId) => {
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);

    if (parentIndex === undefined) return;

    const subElements = state.form.elements[parentIndex].properties?.subElements;
    if (subElements) {
      state.form.elements[parentIndex].properties.subElements = removeElementById(
        subElements,
        elementId
      );
    }
  });
};
