import { type TemplateStore } from "../../types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

export const addSubChoice: TemplateStore<"addSubChoice"> = (set) => (elId, subIndex) => {
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);
    if (parentIndex === undefined) return;
    const choices =
      state.form.elements[parentIndex].properties.subElements?.[subIndex].properties.choices;

    if (!choices || choices.length >= MAX_CHOICE_AMOUNT) {
      return;
    }

    choices.push({
      en: "",
      fr: "",
    });
  });
};
