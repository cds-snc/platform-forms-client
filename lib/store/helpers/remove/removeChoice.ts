import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";

export const removeChoice: TemplateStore<"removeChoice"> = (set) => (elIndex, choiceIndex) => {
  set((state) => {
    (state.form.elements[elIndex].properties as ElementProperties<"dropdown">).choices?.splice(
      choiceIndex,
      1
    );
  });
};
