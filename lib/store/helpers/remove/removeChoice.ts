import { type TemplateStore } from "../../types";

export const removeChoice: TemplateStore<"removeChoice"> = (set) => (elIndex, choiceIndex) => {
  set((state) => {
    state.form.elements[elIndex].properties.choices?.splice(choiceIndex, 1);
  });
};
