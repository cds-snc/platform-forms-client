import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";
import { getParentIndex } from "@lib/utils/form-builder/getPath";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

export const addSubChoice: TemplateStore<"addSubChoice"> = (set) => (elId, subIndex) => {
  set((state) => {
    const parentIndex = getParentIndex(elId, state.form.elements);
    if (parentIndex === undefined) return;
    const parentProperties = state.form.elements[parentIndex]
      .properties as ElementProperties<"dynamicRow">;
    const subElement = parentProperties.subElements?.[subIndex];
    const choices = subElement && (subElement.properties as ElementProperties<"dropdown">).choices;

    if (!choices || choices.length >= MAX_CHOICE_AMOUNT) {
      return;
    }

    choices.push({
      en: "",
      fr: "",
    });
  });
};
