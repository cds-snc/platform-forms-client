import { TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

export const removeSubChoice: TemplateStore<"removeSubChoice"> =
  (set) => (elId, subIndex, choiceIndex) => {
    set((state) => {
      const parentIndex = getParentIndex(elId, state.form.elements);
      if (parentIndex === undefined) return;
      const parentProperties = state.form.elements[parentIndex]
        .properties as ElementProperties<"dynamicRow">;
      const subElement = parentProperties.subElements?.[subIndex];
      (subElement?.properties as ElementProperties<"dropdown"> | undefined)?.choices?.splice(
        choiceIndex,
        1
      );
    });
  };
