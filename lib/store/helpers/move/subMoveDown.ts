import { type TemplateStore } from "../../types";
import { moveElementDown } from "@lib/utils/form-builder";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

export const subMoveDown: TemplateStore<"subMoveDown"> =
  (set) =>
  (elId, subIndex = 0) =>
    set((state) => {
      const parentIndex = getParentIndex(elId, state.form.elements);

      if (parentIndex === undefined) return;

      const elements = state.form.elements[parentIndex].properties.subElements;

      if (elements) {
        state.form.elements[parentIndex].properties.subElements = moveElementDown(
          elements,
          subIndex
        );
      }
    });
