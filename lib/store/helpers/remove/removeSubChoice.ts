import { TemplateStore } from "../../types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

export const removeSubChoice: TemplateStore<"removeSubChoice"> =
  (set) => (elId, subIndex, choiceIndex) => {
    set((state) => {
      const parentIndex = getParentIndex(elId, state.form.elements);
      if (parentIndex === undefined) return;
      state.form.elements[parentIndex].properties.subElements?.[
        subIndex
      ].properties.choices?.splice(choiceIndex, 1);
    });
  };
