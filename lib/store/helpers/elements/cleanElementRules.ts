import { logMessage } from "@lib/logger";

import { type TemplateStore } from "../../types";

export const cleanElementRules: TemplateStore<"cleanElementRules"> = (set) => async () => {
  set((state) => {
    state.form.elements.forEach((element) => {
      if (element.properties?.conditionalRules) {
        // Existing rules
        const elementRules = element.properties.conditionalRules;

        // Updated rules
        const updatedRules = elementRules.filter((rule) => {
          const parentId = rule.choiceId.split(".")[0];
          const parentElement = state.form.elements.find((el) => el.id === Number(parentId));

          // Remove the rule if the parent element is not found
          // This can happen if the element was removed but the rule was not cleaned up
          if (!parentElement) {
            return false;
          }
        });

        if (updatedRules.length !== elementRules.length) {
          logMessage.info(
            `cleaned rules:${JSON.stringify(elementRules)} -> ${JSON.stringify(updatedRules)}`
          );

          // Update the element with the cleaned rules
          element.properties.conditionalRules = updatedRules;
        }
      }
    });
  });
};
