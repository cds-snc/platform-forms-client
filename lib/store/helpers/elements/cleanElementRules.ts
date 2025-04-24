import { type TemplateStore } from "../../types";

export const cleanElementRules: TemplateStore<"cleanElementRules"> = (set) => async () => {
  set((state) => {
    state.form.elements.forEach((element) => {
      if (element.properties?.conditionalRules) {
        // Existing rules
        const elementRules = element.properties.conditionalRules;

        // Update rules
        const updatedRules = elementRules.filter((rule) => {
          const parentId = rule.choiceId.split(".")[0];
          const parentElement = state.form.elements.find((el) => el.id === Number(parentId));
          if (!parentElement) {
            return false;
          }
        });

        if (updatedRules.length !== elementRules.length) {
          element.properties.conditionalRules = updatedRules;
        }
      }
    });
  });
};
