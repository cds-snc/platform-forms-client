import { logMessage } from "@lib/logger";
import { type TemplateStore } from "../../types";
import { cleanRules } from "@lib/formContext";
import { v4 as uuid } from "uuid";

export const transformElement: TemplateStore<"transformElement"> = (set) => async () => {
  set((state) => {
    state.form.elements.forEach((element) => {
      // Clean Element Rules
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

      // Ensure default questionId property is set
      if (element.properties?.questionId === undefined) {
        element.properties.questionId = uuid();
      }
    });
  });
};
