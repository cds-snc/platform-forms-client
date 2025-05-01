import { logMessage } from "@lib/logger";
import { transformSchemaOptions, type TemplateStore } from "../../types";
import { cleanRules } from "@lib/formContext";
import { v4 as uuid } from "uuid";
import { FormElement } from "@gcforms/types";

// Clean conditional rules
const cleanElementRules = (elements: FormElement[], element: FormElement) => {
  if (element.properties?.conditionalRules) {
    const elementRules = element.properties.conditionalRules;
    const updatedRules = cleanRules(elements, elementRules);

    if (updatedRules.length !== elementRules.length) {
      logMessage.info(
        `cleaned rules:${JSON.stringify(elementRules)} -> ${JSON.stringify(updatedRules)}`
      );
      element.properties.conditionalRules = updatedRules;
    }
  }
};

// Ensure questionId is set
const ensureQuestionId = (element: FormElement) => {
  if (element.properties?.questionId === undefined) {
    element.properties.questionId = uuid();
  }
};

export const transforms: TemplateStore<"transforms"> =
  (set) => async (options: transformSchemaOptions) => {
    set((state) => {
      state.form.elements.forEach((element) => {
        if (options.cleanRules) {
          cleanElementRules(state.form.elements, element);
        }
        ensureQuestionId(element);
      });
    });
  };
