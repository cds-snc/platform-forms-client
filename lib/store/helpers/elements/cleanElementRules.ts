import { logMessage } from "@lib/logger";

import { type TemplateStore } from "../../types";

import { cleanRules } from "@lib/formContext";

export const cleanElementRules: TemplateStore<"cleanElementRules"> = (set) => async () => {
  set((state) => {
    state.form.elements.forEach((element) => {
      if (element.properties?.conditionalRules) {
        // Existing rules
        const elementRules = element.properties.conditionalRules;

        const updatedRules = cleanRules(state.form.elements, elementRules);

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
