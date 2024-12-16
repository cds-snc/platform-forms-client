import { type TemplateStore } from "../../types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

export const addSubChoice: TemplateStore<"addSubChoice"> = (set) => (elId, subIndex) => {
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);
    if (parentIndex === undefined) return;
    state.form.elements[parentIndex].properties.subElements?.[subIndex].properties.choices?.push({
      en: "",
      fr: "",
    });
  });
};
