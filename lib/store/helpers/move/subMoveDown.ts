import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";
import { moveElementDown } from "@lib/utils/form-builder";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

export const subMoveDown: TemplateStore<"subMoveDown"> =
  (set) =>
  (elId, subIndex = 0) =>
    set((state) => {
      const parentIndex = getParentIndex(elId, state.form.elements);

      if (parentIndex === undefined) return;

      const parentProperties = state.form.elements[parentIndex]
        .properties as ElementProperties<"dynamicRow">;
      const elements = parentProperties.subElements;

      if (elements) {
        parentProperties.subElements = moveElementDown(elements, subIndex);
      }
    });
