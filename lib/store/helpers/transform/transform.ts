import { type TemplateStore } from "../../types";
import { hasCleanedRules } from "../elements/transformFormProperties";
import { v4 as uuid } from "uuid";

export const transform: TemplateStore<"transform"> = (set) => () => {
  set((state) => {
    state.form.elements.forEach((element, index) => {
      if (element.uuid === undefined) {
        state.form.elements[index] = { ...element, uuid: uuid() };
      }

      const rules = hasCleanedRules(state.form.elements, element);

      if (rules) {
        state.form.elements[index].properties.conditionalRules = rules;
      }
    });
  });
};
