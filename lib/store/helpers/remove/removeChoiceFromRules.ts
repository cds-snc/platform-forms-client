import { type TemplateStore } from "../../types";
import { decrementChoiceIds } from "@lib/formContext";

export const removeChoiceFromRules: TemplateStore<"removeChoiceFromRules"> =
  (set) => (elId: string, choiceIndex: number) => {
    set((state) => {
      const choiceId = `${elId}.${choiceIndex}`;
      const rules = decrementChoiceIds({ formElements: state.form.elements, choiceId });
      state.form.elements.forEach((element) => {
        // If element id is in the rules array, update the conditionalRules property
        if (rules[element.id]) {
          element.properties.conditionalRules = rules[element.id];
        }
      });
    });
  };
