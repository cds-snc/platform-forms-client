import { type TemplateStore } from "../../types";
import { type FormElement, type FormProperties } from "@gcforms/types";
import { cleanRules } from "@gcforms/core";
import { logMessage } from "@lib/logger";
import { v4 as uuid } from "uuid";

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

const ensureUUID = (element: FormElement) => {
  if (element.uuid === undefined) {
    element.uuid = uuid();
  }
};

export const transformFormProperties = (form?: FormProperties): FormProperties => {
  if (!form) {
    return {} as FormProperties;
  }

  const transformedForm = JSON.parse(JSON.stringify(form)) as FormProperties;

  transformedForm.elements.forEach((element) => {
    cleanElementRules(transformedForm.elements, element);
    ensureUUID(element);
  });

  return transformedForm;
};

export const hasCleanedRules = (elements: FormElement[], element: FormElement) => {
  if (element.properties?.conditionalRules) {
    const elementRules = element.properties.conditionalRules;
    const updatedRules = cleanRules(elements, elementRules);

    if (updatedRules.length !== elementRules.length) {
      return updatedRules;
    }
  }

  return;
};

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
